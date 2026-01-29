import { systemRoles } from "../../utils/systemRoles.js";

export const categoryApiRoles = {
    CREATE_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
} 