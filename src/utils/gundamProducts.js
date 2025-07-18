// Gundam Product Data Structure to match Django backend models
// This file defines the structure and sample data for Gundam products

export const GUNDAM_GRADES = {
    HG: 'High Grade',
    RG: 'Real Grade',
    MG: 'Master Grade',
    PG: 'Perfect Grade',
    FM: 'Full Mechanics',
    RE: 'RE/100',
    SD: 'Super Deformed',
    EG: 'Entry Grade',
    FM: 'Full Mechanics',
    VK: 'Ver.Ka'
};

export const GUNDAM_SCALES = {
    '1/144': '1/144 Scale',
    '1/100': '1/100 Scale',
    '1/60': '1/60 Scale',
    '1/48': '1/48 Scale',
    '1/72': '1/72 Scale',
    '1/35': '1/35 Scale',
    'SD': 'Super Deformed'
};

export const GUNDAM_SERIES = {
    'UC': 'Universal Century',
    'AC': 'After Colony',
    'CE': 'Cosmic Era',
    'AD': 'Anno Domini',
    'AG': 'Advanced Generation',
    'PD': 'Post Disaster',
    'AS': 'Ad Stella',
    'CC': 'Correct Century',
    'FC': 'Future Century',
    'AW': 'After War',
    'CE': 'Cosmic Era',
    'RC': 'Regild Century'
};

// Sample Gundam products data structure matching Django backend
export const sampleGundamProducts = [
    {
        id: 1,
        name: "RX-78-2 Gundam",
        slug: "rx-78-2-gundam",
        description: "The RX-78-2 Gundam is the titular mobile suit of the original Mobile Suit Gundam series. This model kit features excellent articulation, detailed panel lines, and comes with the iconic beam rifle, beam saber, and shield.",
        price: "24.99",
        sale_price: null,
        sku: "BAN-001",
        stock_quantity: 50,
        is_active: true,
        is_featured: true,
        weight: 0.5,
        dimensions: "15cm x 8cm x 5cm",

        // Gundam-specific fields
        grade: "HG",
        scale: "1/144",
        series: "UC",
        release_date: "1979-04-07",
        manufacturer: "Bandai",
        model_number: "RX-78-2",
        pilot: "Amuro Ray",
        height: "18.5m",
        weight_mecha: "43.4t",
        armor_material: "Luna Titanium",
        power_source: "Minovsky Ultracompact Fusion Reactor",

        // Specifications
        specifications: {
            head_height: "18.5m",
            weight: "43.4t",
            power_output: "1380kW",
            generator_output: "1380kW",
            thruster_output: "55500kg",
            sensor_range: "5700m",
            armor_material: "Luna Titanium",
            power_source: "Minovsky Ultracompact Fusion Reactor"
        },

        // Images
        main_image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop"
        ],

        // Categories
        categories: ["Universal Century", "High Grade", "1/144 Scale"],

        // Reviews and ratings
        average_rating: 4.8,
        review_count: 125,

        // SEO
        meta_title: "RX-78-2 Gundam 1/144 HG Model Kit",
        meta_description: "Build the iconic RX-78-2 Gundam with this detailed 1/144 High Grade model kit from Bandai.",

        // Timestamps
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
    },
    {
        id: 2,
        name: "MS-06S Zaku II Char's Custom",
        slug: "ms-06s-zaku-ii-chars-custom",
        description: "The MS-06S Zaku II Commander Type, piloted by the legendary Char Aznable, is one of the most iconic mobile suits in Gundam history. This model features the distinctive red color scheme and detailed armor plating.",
        price: "19.99",
        sale_price: null,
        sku: "BAN-002",
        stock_quantity: 35,
        is_active: true,
        is_featured: false,
        weight: 0.4,
        dimensions: "14cm x 7cm x 4cm",

        // Gundam-specific fields
        grade: "HG",
        scale: "1/144",
        series: "UC",
        release_date: "1979-04-07",
        manufacturer: "Bandai",
        model_number: "MS-06S",
        pilot: "Char Aznable",
        height: "17.5m",
        weight_mecha: "58.1t",
        armor_material: "Super High Tensile Steel",
        power_source: "Minovsky Ultracompact Fusion Reactor",

        // Specifications
        specifications: {
            head_height: "17.5m",
            weight: "58.1t",
            power_output: "976kW",
            generator_output: "976kW",
            thruster_output: "47000kg",
            sensor_range: "3200m",
            armor_material: "Super High Tensile Steel",
            power_source: "Minovsky Ultracompact Fusion Reactor"
        },

        // Images
        main_image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop"
        ],

        // Categories
        categories: ["Universal Century", "High Grade", "1/144 Scale"],

        // Reviews and ratings
        average_rating: 4.6,
        review_count: 89,

        // SEO
        meta_title: "MS-06S Zaku II Char's Custom 1/144 HG Model Kit",
        meta_description: "Build Char's iconic red Zaku II with this detailed 1/144 High Grade model kit.",

        // Timestamps
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
    },
    {
        id: 3,
        name: "XXXG-01W Wing Gundam",
        slug: "xxxg-01w-wing-gundam",
        description: "The XXXG-01W Wing Gundam from Mobile Suit Gundam Wing features a sleek design with bird-like wings and the powerful buster rifle. This Master Grade model offers superior detail and articulation.",
        price: "29.99",
        sale_price: "24.99",
        sku: "BAN-003",
        stock_quantity: 25,
        is_active: true,
        is_featured: true,
        weight: 0.8,
        dimensions: "18cm x 10cm x 6cm",

        // Gundam-specific fields
        grade: "MG",
        scale: "1/100",
        series: "AC",
        release_date: "1995-04-07",
        manufacturer: "Bandai",
        model_number: "XXXG-01W",
        pilot: "Heero Yuy",
        height: "16.3m",
        weight_mecha: "7.1t",
        armor_material: "Gundanium Alloy",
        power_source: "Ultracompact Fusion Reactor",

        // Specifications
        specifications: {
            head_height: "16.3m",
            weight: "7.1t",
            power_output: "3732kW",
            generator_output: "3732kW",
            thruster_output: "88150kg",
            sensor_range: "12000m",
            armor_material: "Gundanium Alloy",
            power_source: "Ultracompact Fusion Reactor"
        },

        // Images
        main_image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop"
        ],

        // Categories
        categories: ["After Colony", "Master Grade", "1/100 Scale"],

        // Reviews and ratings
        average_rating: 4.9,
        review_count: 156,

        // SEO
        meta_title: "XXXG-01W Wing Gundam 1/100 MG Model Kit",
        meta_description: "Build the iconic Wing Gundam with this detailed 1/100 Master Grade model kit.",

        // Timestamps
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
    }
];

// Helper functions for working with Gundam products
export const getGradeDisplayName = (grade) => {
    return GUNDAM_GRADES[grade] || grade;
};

export const getScaleDisplayName = (scale) => {
    return GUNDAM_SCALES[scale] || scale;
};

export const getSeriesDisplayName = (series) => {
    return GUNDAM_SERIES[series] || series;
};

export const filterProductsByGrade = (products, grade) => {
    return products.filter(product => product.grade === grade);
};

export const filterProductsByScale = (products, scale) => {
    return products.filter(product => product.scale === scale);
};

export const filterProductsBySeries = (products, series) => {
    return products.filter(product => product.series === series);
};

export const sortProductsByPrice = (products, ascending = true) => {
    return [...products].sort((a, b) => {
        const priceA = parseFloat(a.sale_price || a.price);
        const priceB = parseFloat(b.sale_price || b.price);
        return ascending ? priceA - priceB : priceB - priceA;
    });
};

export const sortProductsByRating = (products, ascending = false) => {
    return [...products].sort((a, b) => {
        return ascending ? a.average_rating - b.average_rating : b.average_rating - a.average_rating;
    });
};

export const sortProductsByReleaseDate = (products, ascending = false) => {
    return [...products].sort((a, b) => {
        const dateA = new Date(a.release_date);
        const dateB = new Date(b.release_date);
        return ascending ? dateA - dateB : dateB - dateA;
    });
};

export default sampleGundamProducts; 