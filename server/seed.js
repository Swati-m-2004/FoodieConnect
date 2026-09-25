const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Food = require('./models/Food');
const Order = require('./models/Order');
const DeliveryAgent = require('./models/DeliveryAgent');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodieconnect');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Food.deleteMany({});
    await Order.deleteMany({});
    await DeliveryAgent.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create Super Admin
    const superAdmin = await User.create({
      name: 'Platform Super Admin',
      email: 'admin@foodieconnect.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'superAdmin',
      addresses: []
    });

    // 2. Create Restaurant Admins
    const adminSpiceGarden = await User.create({
      name: 'Spice Garden Admin',
      email: 'spicegarden@demo.com',
      phone: '9876543211',
      password: 'password123',
      role: 'restaurantAdmin'
    });

    const adminRoyalBiryani = await User.create({
      name: 'Royal Biryani Admin',
      email: 'royalbiryani@demo.com',
      phone: '9876543212',
      password: 'password123',
      role: 'restaurantAdmin'
    });

    const adminHubliDarbar = await User.create({
      name: 'Hubli Darbar Admin',
      email: 'hublidarbar@demo.com',
      phone: '9876543213',
      password: 'password123',
      role: 'restaurantAdmin'
    });

    const adminPizzaGalleria = await User.create({
      name: 'Pizza Galleria Admin',
      email: 'pizzagalleria@demo.com',
      phone: '9876543214',
      password: 'password123',
      role: 'restaurantAdmin'
    });

    // 3. Create Delivery Agents (User + DeliveryAgent model)
    const agentGadagUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'agent.gadag@demo.com',
      phone: '9876543220',
      password: 'password123',
      role: 'deliveryAgent'
    });

    const agentGadag = await DeliveryAgent.create({
      user: agentGadagUser._id,
      name: 'Ramesh Kumar',
      email: 'agent.gadag@demo.com',
      phone: '9876543220',
      serviceArea: 'Gadag',
      currentLocation: {
        type: 'Point',
        coordinates: [75.6267, 15.4284]
      },
      isAvailable: true
    });

    const agentHubliUser = await User.create({
      name: 'Sunil Patil',
      email: 'agent.hubli@demo.com',
      phone: '9876543221',
      password: 'password123',
      role: 'deliveryAgent'
    });

    const agentHubli = await DeliveryAgent.create({
      user: agentHubliUser._id,
      name: 'Sunil Patil',
      email: 'agent.hubli@demo.com',
      phone: '9876543221',
      serviceArea: 'Hubli',
      currentLocation: {
        type: 'Point',
        coordinates: [75.1240, 15.3647]
      },
      isAvailable: true
    });

    // 4. Create Customers with saved addresses
    const customerGadag = await User.create({
      name: 'Swati Deshmukh',
      email: 'customer@demo.com',
      phone: '9876543230',
      password: 'password123',
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          house: 'Flat 302, Shanti Nilaya',
          area: 'Station Road',
          city: 'Gadag',
          state: 'Karnataka',
          pincode: '582101',
          fullAddress: 'Flat 302, Shanti Nilaya, Station Road, Gadag - 582101',
          location: {
            type: 'Point',
            coordinates: [75.6260, 15.4290] // ~0.2 km from Spice Garden
          },
          isDefault: true
        },
        {
          label: 'College',
          house: 'Department of CS',
          area: 'Engineering College Road',
          city: 'Gadag',
          state: 'Karnataka',
          pincode: '582102',
          fullAddress: 'Department of CS, Engineering College Road, Gadag - 582102',
          location: {
            type: 'Point',
            coordinates: [75.6400, 15.4400] // ~2.2 km from Station Road
          },
          isDefault: false
        }
      ]
    });

    const customerHubli = await User.create({
      name: 'Anand Joshi',
      email: 'anand@demo.com',
      phone: '9876543231',
      password: 'password123',
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          house: 'Plot 45, Green Park',
          area: 'Vidyanagar',
          city: 'Hubli',
          state: 'Karnataka',
          pincode: '580021',
          fullAddress: 'Plot 45, Green Park, Vidyanagar, Hubli - 580021',
          location: {
            type: 'Point',
            coordinates: [75.1235, 15.3640]
          },
          isDefault: true
        }
      ]
    });

    // 5. Create Restaurants
    // Gadag Restaurants
    const spiceGarden = await Restaurant.create({
      name: 'Spice Garden',
      description: 'Authentic South & North Indian delicacies cooked with traditional spices and fresh farm ingredients.',
      email: 'spicegarden@demo.com',
      phone: '08372-223344',
      cuisine: ['North Indian', 'South Indian', 'Mughlai'],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60',
      address: 'Shop 12-14, Opp. Railway Station, Station Road',
      city: 'Gadag',
      area: 'Station Road',
      state: 'Karnataka',
      pincode: '582101',
      location: {
        type: 'Point',
        coordinates: [75.6267, 15.4284]
      },
      deliveryRadius: 6, // 6 km radius
      deliveryFee: 30,
      minOrderAmount: 150,
      estimatedDeliveryTime: '25-35 min',
      rating: 4.6,
      openingTime: '10:00 AM',
      closingTime: '11:00 PM',
      isOpen: true,
      isApproved: true,
      admin: adminSpiceGarden._id
    });

    const royalBiryani = await Restaurant.create({
      name: 'Royal Biryani & Rolls',
      description: 'Rich slow-cooked Dum Biryanis, crispy rolls, and spicy sizzling kebabs.',
      email: 'royalbiryani@demo.com',
      phone: '08372-225566',
      cuisine: ['Biryani', 'Rolls', 'Fast Food'],
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60',
      address: 'Near Old Bus Stand, Masari',
      city: 'Gadag',
      area: 'Masari',
      state: 'Karnataka',
      pincode: '582101',
      location: {
        type: 'Point',
        coordinates: [75.6320, 15.4310]
      },
      deliveryRadius: 5,
      deliveryFee: 25,
      minOrderAmount: 120,
      estimatedDeliveryTime: '20-30 min',
      rating: 4.4,
      openingTime: '11:00 AM',
      closingTime: '11:30 PM',
      isOpen: true,
      isApproved: true,
      admin: adminRoyalBiryani._id
    });

    // Hubli Restaurants
    const hubliDarbar = await Restaurant.create({
      name: 'Hubli Darbar',
      description: 'The taste of North Karnataka royal dining with lip-smacking curries, starters, and Chinese delights.',
      email: 'hublidarbar@demo.com',
      phone: '0836-2371234',
      cuisine: ['North Indian', 'Chinese', 'Desserts'],
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=60',
      address: 'Near BVB College Campus, Vidyanagar',
      city: 'Hubli',
      area: 'Vidyanagar',
      state: 'Karnataka',
      pincode: '580021',
      location: {
        type: 'Point',
        coordinates: [75.1240, 15.3647]
      },
      deliveryRadius: 7,
      deliveryFee: 40,
      minOrderAmount: 200,
      estimatedDeliveryTime: '30-40 min',
      rating: 4.7,
      openingTime: '11:00 AM',
      closingTime: '11:00 PM',
      isOpen: true,
      isApproved: true,
      admin: adminHubliDarbar._id
    });

    const pizzaGalleria = await Restaurant.create({
      name: 'Pizza Galleria',
      description: 'Artisanal stone-baked pizzas loaded with gooey mozzarella and fresh herbs.',
      email: 'pizzagalleria@demo.com',
      phone: '0836-2358900',
      cuisine: ['Pizza', 'Italian', 'Snacks'],
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
      address: 'Galaxy Mall, Gokul Road',
      city: 'Hubli',
      area: 'Gokul Road',
      state: 'Karnataka',
      pincode: '580030',
      location: {
        type: 'Point',
        coordinates: [75.1050, 15.3520]
      },
      deliveryRadius: 6,
      deliveryFee: 35,
      minOrderAmount: 180,
      estimatedDeliveryTime: '25-35 min',
      rating: 4.5,
      openingTime: '12:00 PM',
      closingTime: '11:00 PM',
      isOpen: true,
      isApproved: true,
      admin: adminPizzaGalleria._id
    });

    // 6. Create Food Items for each restaurant
    const foodItems = [
      // Spice Garden (Gadag)
      {
        restaurant: spiceGarden._id,
        name: 'Special Chicken Dum Biryani',
        description: 'Tender chicken marinated in spices and layered with fragrant basmati rice, served with raita and salan.',
        price: 260,
        category: 'Biryani',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60',
        isVegetarian: false,
        isAvailable: true
      },
      {
        restaurant: spiceGarden._id,
        name: 'Paneer Butter Masala',
        description: 'Cubes of cottage cheese simmered in a creamy, velvety tomato cashew gravy with fenugreek.',
        price: 220,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: spiceGarden._id,
        name: 'Butter Garlic Naan',
        description: 'Soft tandoori leavened flatbread brushed with aromatic garlic butter.',
        price: 50,
        category: 'Breads & Rice',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: spiceGarden._id,
        name: 'Crispy Veg Spring Rolls',
        description: 'Golden fried crispy rolls stuffed with shredded vegetables and served with sweet chilli dip.',
        price: 150,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: spiceGarden._id,
        name: 'Mango Lassi',
        description: 'Thick and chilled churned yogurt blended with sweet Alphonso mango pulp.',
        price: 80,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },

      // Royal Biryani & Rolls (Gadag)
      {
        restaurant: royalBiryani._id,
        name: 'Hyderabadi Veg Dum Biryani',
        description: 'Fresh vegetables and paneer infused with saffron and cooked on dum in sealed pot.',
        price: 190,
        category: 'Biryani',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: royalBiryani._id,
        name: 'Paneer Tikka Roll',
        description: 'Char-grilled spiced paneer wrapped in flaky paratha with mint sauce and onion rings.',
        price: 130,
        category: 'Rolls',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: royalBiryani._id,
        name: 'Chicken Kathi Roll',
        description: 'Succulent juicy chicken chunks rolled in golden egg paratha with tangy masala sauce.',
        price: 160,
        category: 'Rolls',
        image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=60',
        isVegetarian: false,
        isAvailable: true
      },
      {
        restaurant: royalBiryani._id,
        name: 'Peri Peri Crispy Fries',
        description: 'Golden fried potato fries tossed in fiery African peri-peri seasoning.',
        price: 99,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },

      // Hubli Darbar (Hubli)
      {
        restaurant: hubliDarbar._id,
        name: 'Dal Makhani Royal',
        description: 'Slow-cooked whole black lentils with cream, butter, and mild aromatic spices.',
        price: 210,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: hubliDarbar._id,
        name: 'Tandoori Murgh (Half)',
        description: 'Juicy chicken roasted in clay oven with red chili and curd marinade.',
        price: 270,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=60',
        isVegetarian: false,
        isAvailable: true
      },
      {
        restaurant: hubliDarbar._id,
        name: 'Veg Hakka Noodles',
        description: 'Wok-tossed noodles with crisp seasonal vegetables and oriental soy seasoning.',
        price: 170,
        category: 'Chinese',
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: hubliDarbar._id,
        name: 'Warm Gulab Jamun (2 Pcs)',
        description: 'Soft milk solids dumplings deep-fried and soaked in warm cardamom sugar syrup.',
        price: 70,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },

      // Pizza Galleria (Hubli)
      {
        restaurant: pizzaGalleria._id,
        name: 'Margherita Classic Pizza (10")',
        description: 'Classic Italian tomato sauce, loads of melted mozzarella, and fresh basil leaves.',
        price: 249,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: pizzaGalleria._id,
        name: 'Farmhouse Supreme Pizza (10")',
        description: 'Loaded with bell peppers, mushrooms, sweet corn, black olives, and jalapenos.',
        price: 329,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: pizzaGalleria._id,
        name: 'Cheesy Garlic Bread',
        description: 'Toasted baguette with herb garlic butter and a thick blanket of baked mozzarella.',
        price: 139,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1619881589775-685b3a869818?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      },
      {
        restaurant: pizzaGalleria._id,
        name: 'Molten Choco Lava Cake',
        description: 'Warm chocolate cake with an irresistible warm liquid chocolate center.',
        price: 99,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=60',
        isVegetarian: true,
        isAvailable: true
      }
    ];

    await Food.insertMany(foodItems);

    // 7. Create a Sample Demo Order
    await Order.create({
      customer: customerGadag._id,
      restaurant: spiceGarden._id,
      items: [
        {
          food: (await Food.findOne({ name: 'Special Chicken Dum Biryani' }))._id,
          name: 'Special Chicken Dum Biryani',
          price: 260,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60'
        },
        {
          food: (await Food.findOne({ name: 'Mango Lassi' }))._id,
          name: 'Mango Lassi',
          price: 80,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=60'
        }
      ],
      deliveryAddress: customerGadag.addresses[0],
      deliveryLocation: customerGadag.addresses[0].location,
      subtotal: 600,
      deliveryFee: 30,
      tax: 30,
      discount: 0,
      totalAmount: 660,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'Confirmed',
      deliveryAgent: agentGadagUser._id,
      statusTimeline: [
        { status: 'Pending', timestamp: new Date(Date.now() - 3600000), note: 'Order placed by customer' },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 1800000), note: 'Accepted by Spice Garden' }
      ]
    });

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Demo Accounts:');
    console.log('1. Super Admin:       admin@foodieconnect.com / admin123');
    console.log('2. Gadag Rest Admin:  spicegarden@demo.com / password123');
    console.log('3. Hubli Rest Admin:  hublidarbar@demo.com / password123');
    console.log('4. Gadag Agent:       agent.gadag@demo.com / password123');
    console.log('5. Gadag Customer:    customer@demo.com / password123');
    console.log('--------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
