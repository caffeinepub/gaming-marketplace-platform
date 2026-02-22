import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PaymentConfig {
    cryptoWalletAddress: string;
    ukGiftCardInstructions: string;
    paypalEmail: string;
}
export interface Category {
    name: string;
    description: string;
}
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface Product {
    id: string;
    imageUrls: Array<string>;
    name: string;
    description: string;
    productType: ProductType;
    image: ExternalBlob;
    priceGBP: number;
    quantityAvailable: bigint;
    gameCategory: string;
}
export enum ProductType {
    clothes = "clothes",
    currency = "currency",
    account = "account"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCategory(name: string, category: Category): Promise<void>;
    createProduct(id: string, product: Product): Promise<void>;
    deleteCategory(name: string): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCategory(name: string): Promise<Category>;
    getPaymentDetails(): Promise<PaymentConfig>;
    getProduct(id: string): Promise<Product>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCartItemQuantity(productId: string, quantity: bigint): Promise<void>;
    updateCategory(name: string, updatedCategory: Category): Promise<void>;
    updatePaymentDetails(config: PaymentConfig): Promise<void>;
    updateProduct(id: string, updatedProduct: Product): Promise<void>;
}
