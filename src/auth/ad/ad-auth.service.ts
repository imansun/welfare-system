import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ldap from 'ldapjs';
import { AdUser } from './ad-user.interface';

type LdapSearchEntry = {
  object?: Record<string, string>;
  pojo?: {
    objectName?: string;
    attributes?: Array<{
      type: string;
      values: string[];
    }>;
  };
};

type LdapClient = {
  bind: (
    dn: string,
    password: string,
    callback: (error: Error | null) => void,
  ) => void;
  search: (
    baseDn: string,
    options: Record<string, unknown>,
    callback: (error: Error | null, response: NodeJS.EventEmitter) => void,
  ) => void;
  unbind: () => void;
};

@Injectable()
export class AdAuthService {
  constructor(private readonly configService: ConfigService) {}

  isEnabled(): boolean {
    return this.configService.get<string>('AD_ENABLED', 'false') === 'true';
  }

  async validate(username: string, password: string): Promise<AdUser> {
    if (!this.isEnabled()) {
      throw new UnauthorizedException('AD authentication is disabled');
    }

    if (!username || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.findUser(username);
    await this.bind(this.getUserBindDn(username, user.dn), password);

    return user;
  }

  private async findUser(username: string): Promise<AdUser> {
    const bindDn = this.configService.get<string>('AD_BIND_DN', '');
    const bindPassword = this.configService.get<string>('AD_BIND_PASSWORD', '');

    if (!bindDn || !bindPassword) {
      throw new UnauthorizedException('AD bind credentials are not configured');
    }

    const client = this.createClient();

    try {
      await this.clientBind(client, bindDn, bindPassword);
      return await this.searchUser(client, username);
    } finally {
      client.unbind();
    }
  }

  private async bind(dn: string, password: string): Promise<void> {
    const client = this.createClient();

    try {
      await this.clientBind(client, dn, password);
    } finally {
      client.unbind();
    }
  }

  private searchUser(client: LdapClient, username: string): Promise<AdUser> {
    const baseDn = this.configService.get<string>('AD_BASE_DN', '');
    const usernameAttr = this.configService.get<string>(
      'AD_USERNAME_ATTR',
      'sAMAccountName',
    );
    const groupsEnabled =
      this.configService.get<string>('AD_GROUPS_ENABLED', 'false') === 'true';
    const groupsAttr = this.configService.get<string>(
      'AD_GROUPS_ATTR',
      'memberOf',
    );
    const filterTemplate = this.configService.get<string>(
      'AD_USER_FILTER',
      `(&(objectCategory=person)(objectClass=user)(${usernameAttr}={{username}}))`,
    );

    if (!baseDn) {
      throw new UnauthorizedException('AD base DN is not configured');
    }

    const filter = filterTemplate.replace('{{username}}', username);
    const attributes = ['displayName', 'mail', usernameAttr];

    if (groupsEnabled) {
      attributes.push(groupsAttr);
    }

    return new Promise((resolve, reject) => {
      let foundUser: AdUser | null = null;

      client.search(
        baseDn,
        {
          scope: this.configService.get<string>('AD_SEARCH_SCOPE', 'sub'),
          filter,
          sizeLimit: 1,
          attributes,
        },
        (error, response) => {
          if (error) {
            reject(error);
            return;
          }

          response.on('searchEntry', (entry: LdapSearchEntry) => {
            try {
              foundUser = this.mapEntry(entry, username);
            } catch (entryError) {
              reject(entryError);
            }
          });

          response.on('error', reject);
          response.on('end', () => {
            if (!foundUser) {
              reject(new UnauthorizedException('Invalid credentials'));
              return;
            }

            resolve(foundUser);
          });
        },
      );
    });
  }

  private mapEntry(entry: LdapSearchEntry, username: string): AdUser {
    const attributes = this.getAttributes(entry);
    const usernameAttr = this.configService.get<string>(
      'AD_USERNAME_ATTR',
      'sAMAccountName',
    );
    const dn = entry.pojo?.objectName || attributes.dn;

    if (!dn) {
      throw new UnauthorizedException('Invalid AD user');
    }

    return {
      username: attributes[usernameAttr] || username,
      displayName: attributes.displayName || username,
      email: attributes.mail || null,
      dn,
    };
  }

  private getUserBindDn(username: string, dn: string): string {
    const upnSuffix = this.configService.get<string>('AD_UPN_SUFFIX', '');
    const domain = this.configService.get<string>('AD_DOMAIN', '');

    if (upnSuffix && !username.includes('@')) {
      return `${username}@${upnSuffix}`;
    }

    if (domain && !username.includes('\\')) {
      return `${domain}\\${username}`;
    }

    return dn;
  }

  private getAttributes(entry: LdapSearchEntry): Record<string, string> {
    if (entry.object) {
      return entry.object;
    }

    return (
      entry.pojo?.attributes?.reduce<Record<string, string>>(
        (result, attribute) => {
          result[attribute.type] = attribute.values[0] ?? '';
          return result;
        },
        {},
      ) ?? {}
    );
  }

  private clientBind(
    client: LdapClient,
    dn: string,
    password: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      client.bind(dn, password, (error) => {
        if (error) {
          reject(new UnauthorizedException('Invalid credentials'));
          return;
        }

        resolve();
      });
    });
  }

  private createClient(): LdapClient {
    const url = this.configService.get<string>('AD_URL', '');

    if (!url) {
      throw new UnauthorizedException('AD URL is not configured');
    }

    return ldap.createClient({ url }) as LdapClient;
  }
}
