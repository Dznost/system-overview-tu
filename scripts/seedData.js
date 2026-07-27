const mongoose = require('mongoose');
const User = require('../models/User');
const Dish = require('../models/Dish');
const Product = require('../models/Product');
const Branch = require('../models/Branch');
const Event = require('../models/Event');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/la_maison';

async function seedDatabase() {
  try {
    console.log('🌱 Đang kết nối cơ sở dữ liệu...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Kết nối thành công!');

    // Clear existing data
    console.log('🗑️  Đang xóa dữ liệu cũ...');
    await Promise.all([
      User.deleteMany({}),
      Branch.deleteMany({}),
      Dish.deleteMany({}),
      Product.deleteMany({}),
      Event.deleteMany({}),
      Review.deleteMany({}),
      Contact.deleteMany({})
    ]);

    // 1. Create Branches
    console.log('🏢 Đang tạo chi nhánh...');
    const branches = await Branch.insertMany([
      {
        name: 'La Maison - Trung Tâm',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        phone: '0283334444',
        email: 'center@lamaison.vn',
        openTime: '10:00',
        closeTime: '23:00',
        isActive: true,
        capacity: 150
      },
      {
        name: 'La Maison - Bình Thạnh',
        address: '456 Võ Văn Tần, Quận 3, TP.HCM',
        phone: '0283335555',
        email: 'binh-thanh@lamaison.vn',
        openTime: '10:00',
        closeTime: '23:00',
        isActive: true,
        capacity: 100
      },
      {
        name: 'La Maison - Thủ Đức',
        address: '789 Đường Võ Nguyên Giáp, Quận Thủ Đức, TP.HCM',
        phone: '0283336666',
        email: 'thu-duc@lamaison.vn',
        openTime: '10:00',
        closeTime: '22:30',
        isActive: true,
        capacity: 80
      }
    ]);
    console.log(`✅ Tạo thành công ${branches.length} chi nhánh`);

    // 2. Create Admin User
    console.log('👤 Đang tạo tài khoản admin...');
    const adminUser = await User.create({
      name: 'Admin La Maison',
      email: 'admin@lamaison.vn',
      phone: '0283334444',
      password: 'Admin123!',
      role: 'admin',
      avatar: 'https://via.placeholder.com/150?text=Admin',
      address: branches[0]._id,
      isActive: true
    });
    console.log('✅ Tạo admin thành công:', adminUser.email);

    // 3. Create Dishes (15+)
    console.log('🍽️  Đang tạo các món ăn...');
    const dishes = await Dish.insertMany([
      {
        name: 'Steak Bò Mỹ Cao Cấp',
        description: 'Steak bò Mỹ nướng nên lửa, mềm ngon, phục vụ kèm sauce đặc biệt',
        image: 'https://via.placeholder.com/300?text=Steak+Bo',
        category: 'main',
        price: 450000,
        isActive: true,
        isHot: true,
        quantity: 50,
        preparationTime: 25
      },
      {
        name: 'Cá Hồi Nướng Giấy',
        description: 'Cá hồi tươi nướng trong giấy nến, giữ nguyên hương vị',
        image: 'https://via.placeholder.com/300?text=Ca+Hoi',
        category: 'main',
        price: 380000,
        isActive: true,
        isHot: true,
        quantity: 40,
        preparationTime: 20
      },
      {
        name: 'Rau Xào Tỏi',
        description: 'Mix rau xanh tươi xào nhanh với tỏi khô',
        image: 'https://via.placeholder.com/300?text=Rau+Xao',
        category: 'appetizer',
        price: 65000,
        isActive: true,
        quantity: 100,
        preparationTime: 8
      },
      {
        name: 'Tôm Hùm Xốt Cam',
        description: 'Tôm hùm tươi nấu với xốt cam chua ngọt',
        image: 'https://via.placeholder.com/300?text=Tom+Hum',
        category: 'main',
        price: 520000,
        isActive: true,
        isHot: true,
        quantity: 25,
        preparationTime: 30
      },
      {
        name: 'Súp Hành Pháp',
        description: 'Súp hành tây kiểu Pháp truyền thống, phủ pho mát',
        image: 'https://via.placeholder.com/300?text=Sup+Hanh',
        category: 'appetizer',
        price: 95000,
        isActive: true,
        quantity: 80,
        preparationTime: 15
      },
      {
        name: 'Foie Gras Seared',
        description: 'Gan vịt nhanh chín trên chảo nóng, phục vụ với toast',
        image: 'https://via.placeholder.com/300?text=Foie+Gras',
        category: 'appetizer',
        price: 450000,
        isActive: true,
        isHot: true,
        quantity: 15,
        preparationTime: 10
      },
      {
        name: 'Cơm Chiên Dương Châu',
        description: 'Cơm chiên kiểu Trung Quốc với tôm, trứng và rau',
        image: 'https://via.placeholder.com/300?text=Com+Chien',
        category: 'main',
        price: 120000,
        isActive: true,
        quantity: 120,
        preparationTime: 12
      },
      {
        name: 'Pasta Carbonara',
        description: 'Mì spaghetti với xương heo, trứng và pho mát Pecorino',
        image: 'https://via.placeholder.com/300?text=Carbonara',
        category: 'main',
        price: 145000,
        isActive: true,
        quantity: 60,
        preparationTime: 14
      },
      {
        name: 'Vịt Quay Bắc Kinh',
        description: 'Vịt quay theo phương pháp Bắc Kinh, da giòn, thịt mềm',
        image: 'https://via.placeholder.com/300?text=Vit+Quay',
        category: 'main',
        price: 350000,
        isActive: true,
        isHot: true,
        quantity: 20,
        preparationTime: 45
      },
      {
        name: 'Bánh Mousse Socola',
        description: 'Bánh mousse socola đắng nhẹ, ẩm dịu và thơm ngon',
        image: 'https://via.placeholder.com/300?text=Mousse',
        category: 'dessert',
        price: 85000,
        isActive: true,
        quantity: 90,
        preparationTime: 5
      },
      {
        name: 'Crevettes Rôties',
        description: 'Tôm nước ngọt nướng với bơ và tỏi',
        image: 'https://via.placeholder.com/300?text=Crevettes',
        category: 'appetizer',
        price: 210000,
        isActive: true,
        isHot: true,
        quantity: 45,
        preparationTime: 12
      },
      {
        name: 'Salad Caesar',
        description: 'Salad cung cấp với dressing Caesar tự làm và croutons',
        image: 'https://via.placeholder.com/300?text=Caesar+Salad',
        category: 'appetizer',
        price: 110000,
        isActive: true,
        quantity: 70,
        preparationTime: 8
      },
      {
        name: 'Bò Wagyu Kobe',
        description: 'Bò Wagyu hạng A5 cao nhất, nước sốt đặc biệt',
        image: 'https://via.placeholder.com/300?text=Wagyu+Kobe',
        category: 'main',
        price: 850000,
        isActive: true,
        isHot: true,
        quantity: 10,
        preparationTime: 28
      },
      {
        name: 'Tôm Sú Xốt Chanh',
        description: 'Tôm sú nấu với xốt chanh leo và dâu đen',
        image: 'https://via.placeholder.com/300?text=Tom+Su',
        category: 'main',
        price: 280000,
        isActive: true,
        isHot: true,
        quantity: 35,
        preparationTime: 18
      },
      {
        name: 'Tiramisu Nhập Khẩu',
        description: 'Bánh Tiramisu Italy, kích thước 1 phần, tươi mỗi ngày',
        image: 'https://via.placeholder.com/300?text=Tiramisu',
        category: 'dessert',
        price: 95000,
        isActive: true,
        quantity: 100,
        preparationTime: 3
      },
      {
        name: 'Rượu Vang Đỏ Bordeaux',
        description: 'Rượu vang cao cấp từ vùng Bordeaux, Pháp',
        image: 'https://via.placeholder.com/300?text=Wine+Bordeaux',
        category: 'beverage',
        price: 680000,
        isActive: true,
        quantity: 5,
        preparationTime: 1
      }
    ]);
    console.log(`✅ Tạo thành công ${dishes.length} món ăn`);

    // 4. Create Products (Đồ gia dụng) (10+)
    console.log('🏠 Đang tạo sản phẩm đồ gia dụng...');
    const products = await Product.insertMany([
      {
        name: 'Bộ Dao Ăn Cơm Inox 24 Mảnh',
        description: 'Bộ dao ăn cơm cao cấp inox không gỉ, thiết kế sang trọng',
        image: 'https://via.placeholder.com/300?text=Dao+Inox',
        productType: 'home-appliance',
        price: 450000,
        isActive: true,
        isHot: true,
        quantity: 25,
        warrantyMonths: 12
      },
      {
        name: 'Bình Rượu Pha Lê Cao Cấp 1.5L',
        description: 'Bình rượu pha lê Bohemia, thiết kế sang trọng',
        image: 'https://via.placeholder.com/300?text=Binh+Ruu',
        productType: 'home-appliance',
        price: 650000,
        isActive: true,
        isHot: true,
        quantity: 12,
        warrantyMonths: 24
      },
      {
        name: 'Bộ Chén Đĩa Porcelain Trắng',
        description: 'Bộ chén đĩa Porcelain trắng tinh khiết, 12 bộ',
        image: 'https://via.placeholder.com/300?text=Chen+Dia',
        productType: 'home-appliance',
        price: 1200000,
        isActive: true,
        isHot: false,
        quantity: 5,
        warrantyMonths: 12
      },
      {
        name: 'Cốc Rượu Vang Đỏ Bohemia',
        description: 'Cốc rượu vang đỏ Bohemia, bộ 6 cốc',
        image: 'https://via.placeholder.com/300?text=Coc+Ruou',
        productType: 'home-appliance',
        price: 380000,
        isActive: true,
        isHot: true,
        quantity: 30,
        warrantyMonths: 12
      },
      {
        name: 'Tấm Lót Cốc Bằng Da Cao Cấp',
        description: 'Tấm lót cốc bằng da, giảm tiếng ồn, bảo vệ bàn',
        image: 'https://via.placeholder.com/300?text=Tam+Lot',
        productType: 'home-appliance',
        price: 120000,
        isActive: true,
        isHot: false,
        quantity: 50,
        warrantyMonths: 6
      },
      {
        name: 'Khăn Ăn Vải Linen Trắng',
        description: 'Khăn ăn vải linen tinh khiết, kích thước 45x45cm',
        image: 'https://via.placeholder.com/300?text=Khan+An',
        productType: 'home-appliance',
        price: 85000,
        isActive: true,
        isHot: false,
        quantity: 100,
        warrantyMonths: 0
      },
      {
        name: 'Bàn Uống Cà Phê Đồng Vàng',
        description: 'Bàn uống cà phê bằng đồng vàng, thiết kế cổ điển',
        image: 'https://via.placeholder.com/300?text=Ban+Cafe',
        productType: 'home-appliance',
        price: 2500000,
        isActive: true,
        isHot: true,
        quantity: 3,
        warrantyMonths: 24
      },
      {
        name: 'Đèn Chân Đứng Diningroom',
        description: 'Đèn chân đứng phòng ăn, ánh sáng ấm, chân gỗ',
        image: 'https://via.placeholder.com/300?text=Den+Chan',
        productType: 'home-appliance',
        price: 1800000,
        isActive: true,
        isHot: false,
        quantity: 8,
        warrantyMonths: 12
      },
      {
        name: 'Ghế Ăn Nệm Cao Cấp',
        description: 'Ghế ăn bọc nệm, lưng tựa thoải mái, nâu tối',
        image: 'https://via.placeholder.com/300?text=Ghe+An',
        productType: 'home-appliance',
        price: 3200000,
        isActive: true,
        isHot: true,
        quantity: 2,
        warrantyMonths: 24
      },
      {
        name: 'Bình Hoa Gốm Trắng',
        description: 'Bình hoa gốm sứ trắng tinh khiết, cao 35cm',
        image: 'https://via.placeholder.com/300?text=Binh+Hoa',
        productType: 'home-appliance',
        price: 280000,
        isActive: true,
        isHot: false,
        quantity: 15,
        warrantyMonths: 12
      },
      {
        name: 'Cái Nĩa Vàng Pháp Sang Trọng',
        description: 'Cái nĩa vàng 24k phủ mạ vàng, bộ 12 cái',
        image: 'https://via.placeholder.com/300?text=Nia+Vang',
        productType: 'home-appliance',
        price: 890000,
        isActive: true,
        isHot: true,
        quantity: 20,
        warrantyMonths: 12
      }
    ]);
    console.log(`✅ Tạo thành công ${products.length} sản phẩm`);

    // 5. Create Events
    console.log('📅 Đang tạo sự kiện...');
    const events = await Event.insertMany([
      {
        title: 'Tuần Lễ Ẩm Thực Pháp',
        description: 'Tuần lễ ẩm thực Pháp với các đầu bếp từ Paris',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-07'),
        image: 'https://via.placeholder.com/300?text=French+Week',
        isActive: true
      },
      {
        title: 'Khuyến Mãi Mùa Hè 50%',
        description: 'Giảm giá 50% cho tất cả các loại nước uống',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-08-15'),
        image: 'https://via.placeholder.com/300?text=Summer+Sale',
        isActive: true
      },
      {
        title: 'Lễ Khai Trương Chi Nhánh Thủ Đức',
        description: 'Lễ khai trương hoành tráng chi nhánh mới',
        startDate: new Date('2024-08-20'),
        endDate: new Date('2024-08-21'),
        image: 'https://via.placeholder.com/300?text=Grand+Opening',
        isActive: true
      }
    ]);
    console.log(`✅ Tạo thành công ${events.length} sự kiện`);

    // 6. Create Sample Contacts
    console.log('📧 Đang tạo mẫu liên hệ...');
    const contacts = await Contact.insertMany([
      {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@gmail.com',
        phone: '0901234567',
        subject: 'Đặt tiệc sinh nhật',
        message: 'Tôi muốn đặt tiệc sinh nhật cho 50 người vào ngày 15/9',
        status: 'pending',
        isArchived: false,
        priority: 'high'
      },
      {
        name: 'Trần Thị B',
        email: 'tranthib@gmail.com',
        phone: '0912345678',
        subject: 'Vấn đề về chất lượng dịch vụ',
        message: 'Tôi vừa dùng bữa nhưng thái độ phục vụ không tốt',
        status: 'replied',
        replyMessage: 'Cảm ơn bạn đã ghi nhận. Chúng tôi sẽ cải thiện dịch vụ',
        repliedBy: adminUser._id,
        repliedAt: new Date(Date.now() - 86400000),
        isArchived: false,
        priority: 'high'
      },
      {
        name: 'Lê Văn C',
        email: 'levanc@gmail.com',
        phone: '0923456789',
        subject: 'Hợp tác kinh doanh',
        message: 'Tôi muốn trao đổi về khả năng hợp tác với nhà hàng',
        status: 'pending',
        isArchived: false,
        priority: 'medium'
      }
    ]);
    console.log(`✅ Tạo thành công ${contacts.length} liên hệ`);

    console.log('\n🎉 Hoàn thành! Seed data đã được tạo thành công!');
    console.log(`📊 Tóm tắt:`);
    console.log(`   - ${branches.length} chi nhánh`);
    console.log(`   - ${dishes.length} món ăn`);
    console.log(`   - ${products.length} sản phẩm`);
    console.log(`   - ${events.length} sự kiện`);
    console.log(`   - ${contacts.length} liên hệ`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

seedDatabase();
