import { FiZap, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    rating: number;
    image: string;
    premium?: boolean;
    description: string;
    gallery: string[];
    reviews: { user: string; rating: number; comment: string }[];
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Message {
    id: number;
    text: string;
    sender: 'user' | 'specialist';
    timestamp: string;
}

export interface Specialist {
    id: number;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    price: number;
    available: boolean;
    online: boolean;
}

export interface SpecialistVideo {
    id: number;
    specialistId: number;
    title: string;
    thumbnail: string;
    duration: string;
    views: string;
    timestamp: string;
    videoUrl: string;
}

export interface WeeklyPlanItem {
    day: string;
    trainingFocus: string;
    trainingDetails: string;
    nutritionFocus: string;
    nutritionDetails: string;
}

export type WeeklyPlan = WeeklyPlanItem[];

export interface Notification {
    id: number;
    icon: any;
    color: string;
    bg: string;
    title: string;
    message: string;
    time: string;
}
