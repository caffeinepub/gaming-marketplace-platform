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
export interface Category {
    name: string;
    description: string;
}
export interface UserProfile {
    username?: string;
    name: string;
    email: string;
}
export type Time = bigint;
export interface QueueSkipSubmission {
    status: QueueSkipStatus;
    user: Principal;
    giftCardCode?: string;
    giftCardType: GiftCardType;
    timestamp: Time;
    transactionId: string;
}
export interface CartItem {
    productId: string;
    quantity: bigint;
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
export interface PaymentConfig {
    queueSkipPriceGBP: number;
    instagramUrl: string;
    cryptoWalletAddress: string;
    ukGiftCardInstructions: string;
    usernameRegenerationPriceGBP: number;
    paypalEmail: string;
}
export enum GiftCardType {
    cryptocurrency = "cryptocurrency",
    tesco = "tesco",
    other = "other",
    starbucks = "starbucks",
    amazon = "amazon"
}
export enum ProductType {
    clothes = "clothes",
    currency = "currency",
    account = "account"
}
export enum QueueSkipStatus {
    pendingReview = "pendingReview",
    flaggedFraudulent = "flaggedFraudulent",
    approved = "approved"
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
    createUsername(requestedUsername: string): Promise<void>;
    deleteCategory(name: string): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    flagQueueSkipFraud(user: Principal): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCategory(name: string): Promise<Category>;
    getInstagramUrl(): Promise<string>;
    getPaymentDetails(): Promise<PaymentConfig>;
    getProduct(id: string): Promise<Product>;
    getQueueSkipSubmissions(): Promise<Array<QueueSkipSubmission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsername(_user: Principal): Promise<string | null>;
    hasQueueBypass(): Promise<boolean>;
    hasUsername(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQueueSkipPayment(transactionId: string, giftCardType: GiftCardType, giftCardCode: string | null): Promise<void>;
    updateCartItemQuantity(productId: string, quantity: bigint): Promise<void>;
    updateCategory(name: string, updatedCategory: Category): Promise<void>;
    updatePaymentDetails(config: PaymentConfig): Promise<void>;
    updateProduct(id: string, updatedProduct: Product): Promise<void>;
    validateGeneratedUsername(username: string): Promise<void>;
}
