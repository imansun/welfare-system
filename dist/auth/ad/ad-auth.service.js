"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ldap = __importStar(require("ldapjs"));
let AdAuthService = class AdAuthService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    isEnabled() {
        return this.configService.get('AD_ENABLED', 'false') === 'true';
    }
    async validate(username, password) {
        if (!this.isEnabled()) {
            throw new common_1.UnauthorizedException('AD authentication is disabled');
        }
        if (!username || !password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = await this.findUser(username);
        await this.bind(this.getUserBindDn(username, user.dn), password);
        return user;
    }
    async findUser(username) {
        const bindDn = this.configService.get('AD_BIND_DN', '');
        const bindPassword = this.configService.get('AD_BIND_PASSWORD', '');
        if (!bindDn || !bindPassword) {
            throw new common_1.UnauthorizedException('AD bind credentials are not configured');
        }
        const client = this.createClient();
        try {
            await this.clientBind(client, bindDn, bindPassword);
            return await this.searchUser(client, username);
        }
        finally {
            client.unbind();
        }
    }
    async bind(dn, password) {
        const client = this.createClient();
        try {
            await this.clientBind(client, dn, password);
        }
        finally {
            client.unbind();
        }
    }
    searchUser(client, username) {
        const baseDn = this.configService.get('AD_BASE_DN', '');
        const usernameAttr = this.configService.get('AD_USERNAME_ATTR', 'sAMAccountName');
        const groupsEnabled = this.configService.get('AD_GROUPS_ENABLED', 'false') === 'true';
        const groupsAttr = this.configService.get('AD_GROUPS_ATTR', 'memberOf');
        const filterTemplate = this.configService.get('AD_USER_FILTER', `(&(objectCategory=person)(objectClass=user)(${usernameAttr}={{username}}))`);
        if (!baseDn) {
            throw new common_1.UnauthorizedException('AD base DN is not configured');
        }
        const filter = filterTemplate.replace('{{username}}', username);
        const attributes = ['displayName', 'mail', usernameAttr];
        if (groupsEnabled) {
            attributes.push(groupsAttr);
        }
        return new Promise((resolve, reject) => {
            let foundUser = null;
            client.search(baseDn, {
                scope: this.configService.get('AD_SEARCH_SCOPE', 'sub'),
                filter,
                sizeLimit: 1,
                attributes,
            }, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                response.on('searchEntry', (entry) => {
                    try {
                        foundUser = this.mapEntry(entry, username);
                    }
                    catch (entryError) {
                        reject(entryError);
                    }
                });
                response.on('error', reject);
                response.on('end', () => {
                    if (!foundUser) {
                        reject(new common_1.UnauthorizedException('Invalid credentials'));
                        return;
                    }
                    resolve(foundUser);
                });
            });
        });
    }
    mapEntry(entry, username) {
        const attributes = this.getAttributes(entry);
        const usernameAttr = this.configService.get('AD_USERNAME_ATTR', 'sAMAccountName');
        const dn = entry.pojo?.objectName || attributes.dn;
        if (!dn) {
            throw new common_1.UnauthorizedException('Invalid AD user');
        }
        return {
            username: attributes[usernameAttr] || username,
            displayName: attributes.displayName || username,
            email: attributes.mail || null,
            dn,
        };
    }
    getUserBindDn(username, dn) {
        const upnSuffix = this.configService.get('AD_UPN_SUFFIX', '');
        const domain = this.configService.get('AD_DOMAIN', '');
        if (upnSuffix && !username.includes('@')) {
            return `${username}@${upnSuffix}`;
        }
        if (domain && !username.includes('\\')) {
            return `${domain}\\${username}`;
        }
        return dn;
    }
    getAttributes(entry) {
        if (entry.object) {
            return entry.object;
        }
        return (entry.pojo?.attributes?.reduce((result, attribute) => {
            result[attribute.type] = attribute.values[0] ?? '';
            return result;
        }, {}) ?? {});
    }
    clientBind(client, dn, password) {
        return new Promise((resolve, reject) => {
            client.bind(dn, password, (error) => {
                if (error) {
                    reject(new common_1.UnauthorizedException('Invalid credentials'));
                    return;
                }
                resolve();
            });
        });
    }
    createClient() {
        const url = this.configService.get('AD_URL', '');
        if (!url) {
            throw new common_1.UnauthorizedException('AD URL is not configured');
        }
        const client = ldap.createClient({ url });
        client.on('error', (err) => {
            console.error('LDAP client error:', err.message);
        });
        return client;
    }
};
exports.AdAuthService = AdAuthService;
exports.AdAuthService = AdAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AdAuthService);
//# sourceMappingURL=ad-auth.service.js.map