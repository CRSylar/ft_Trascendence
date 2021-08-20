import { SetMetadata } from "@nestjs/common";


export enum Role {
    user = 'user',
    moderator = 'moderator',
    admin = 'admin',
    owner = 'owner'
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata('ROLES_KEY', roles);
