import { User } from "../models/users.js";
import { Business } from "../models/business.js";

class InMemoryCache {
    constructor() {
        this.cache = new Map();
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value) {
        this.cache.set(key, value);
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}

export const UserCache = new InMemoryCache();
export const BuisnessCache = new InMemoryCache();

export const UpdateCache = async () => {
    UserCache.clear();
    BuisnessCache.clear();

    const Users = await User.findAll({
        attributes: ["_id_user"],
    });

    const Businesses = await Business.findAll({
        attributes: ["_id_business"],
    });

    for (const UserInstance of Users) {
        UserCache.set(UserInstance._id_user, true);
    }

    for (const BusinessInstance of Businesses) {
        BuisnessCache.set(BusinessInstance._id_business, true);
    }

    console.log("Cache Updated");
};
