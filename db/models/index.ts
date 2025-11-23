import User from "./user.model";
import Service from "./service.model";
import UserWishlist from "./user.wishlist.model";

User.belongsToMany(Service, { through: UserWishlist, as: "wishlist", foreignKey: "userId" });
Service.belongsToMany(User, { through: UserWishlist, as: "wishlistBy", foreignKey: "serviceId" });

export { User, Service, UserWishlist };