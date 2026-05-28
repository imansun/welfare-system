import { Item } from '../items/item.entity';
export declare class Unit {
    id: string;
    name: string;
    shortName: string;
    isActive: boolean;
    items: Item[];
    createdAt: Date;
    updatedAt: Date;
}
