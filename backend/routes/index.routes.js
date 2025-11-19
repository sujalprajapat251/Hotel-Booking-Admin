const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/uploades')
// const { createUser, userLogin, updateUser, changePassword, googleLogin, forgotPassword, verifyOtp, resetPassword } = require('../controller/userController');
// const { auth } = require('../middleware/auth');
const {
    createRoomType,
    getRoomTypes,
    getRoomTypeById,
    updateRoomType,
    deleteRoomType
} = require('../controller/roomtypecontroller');
const {
    createFeature,
    getFeatures,
    getFeaturesByRoomType,
    getFeatureById,
    updateFeature,
    deleteFeature
} = require('../controller/featuresController');
const { createUser, userLogin, updateUser, changePassword, googleLogin, forgotPassword, verifyOtp, resetPassword, resendOtp, getAllUsers, getUserById } = require('../controller/userController');
const { auth, adminOnly } = require('../middleware/auth');
const { createContact, getAllContact } = require('../controller/contactController');
const { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } = require('../controller/blogController');
const { createTermCondition, getAllTermConditions, getTermConditionById, updateTermCondition, deleteTermCondition } = require('../controller/termsController');
const { createFAQ, getAllFAQ, getFAQById, updateFAQ, deleteFAQ } = require('../controller/faqController');
const { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment } = require('../controller/departmentController');
const { createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff } = require('../controller/staffController');
const {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    autoUpdateRoomBeds,
    getRoomsWithPagination
} = require('../controller/createRoomController');
const {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking
} = require('../controller/bookingController');
const { createCafeCategory, getAllCafeCategories, getSingleCafeCategory, updateCafeCategory, deleteCafeCategory } = require('../controller/cafecategoryController');
const { createCafeItem, getAllCafeItems, getSingleCafeItem, updateCafeItem, deleteCafeItem } = require('../controller/cafeitemController');
const { createAbout, getAllAbout, getAboutById, updateAbout, deleteAbout } = require('../controller/aboutusController');

// auth Routes
indexRoutes.post('/userLogin', userLogin);
indexRoutes.post("/google-login", googleLogin);
indexRoutes.post('/forgotPassword', forgotPassword);
indexRoutes.post('/verifyOtp', verifyOtp)
indexRoutes.post("/resendOtp", resendOtp);
indexRoutes.post('/resetpassword', resetPassword)

// user Routes
indexRoutes.post('/register', createUser);
indexRoutes.put('/userUpdate/:id', auth, upload.single("photo"), updateUser);
indexRoutes.put('/changepassword', auth, changePassword);
indexRoutes.get('/getalluser', auth, adminOnly, getAllUsers);
indexRoutes.get('/getUserById', auth, getUserById);

// contact Routes
indexRoutes.post('/contact', createContact);
indexRoutes.get('/getallcontact', auth, adminOnly, getAllContact);

// blog Routes
indexRoutes.post('/createblog', auth, adminOnly, upload.single("image"), createBlog);
indexRoutes.get('/getallblog', getAllBlogs);
indexRoutes.get('/getblog/:id', getBlogById);
indexRoutes.put('/updateblog/:id', auth, adminOnly, upload.single("image"), updateBlog);
indexRoutes.delete('/deleteblog/:id', auth, adminOnly, deleteBlog);

// about us 
indexRoutes.post('/createAbout', auth, adminOnly, upload.single("image"), createAbout);
indexRoutes.get('/getallAbout', getAllAbout);
indexRoutes.get('/getAbout/:id', getAboutById);
indexRoutes.put('/updateAbout/:id', auth, adminOnly, upload.single("image"), updateAbout);
indexRoutes.delete('/deleteAbout/:id', auth, adminOnly, deleteAbout);

// department Routes
indexRoutes.post('/createdepartment', auth, adminOnly, createDepartment);
indexRoutes.get('/getalldepartment', auth, adminOnly, getAllDepartments);
indexRoutes.get('/getdepartment/:id', auth, adminOnly, getDepartmentById);
indexRoutes.put('/updatedepartment/:id', auth, adminOnly, updateDepartment);
indexRoutes.delete('/deletetdepartment/:id', auth, adminOnly, deleteDepartment);

// staff Routes
indexRoutes.post('/createstaff', auth, adminOnly, upload.single("image"), createStaff);
indexRoutes.get('/getallstaff', auth, adminOnly, getAllStaff);
indexRoutes.get('/getstaff/:id', auth, adminOnly, getStaffById);
indexRoutes.put('/updatestaff/:id', auth, adminOnly, upload.single("image"), updateStaff);
indexRoutes.delete('/deletetstaff/:id', auth, adminOnly, deleteStaff);

// Terms & Condition Routes
indexRoutes.post('/createterms', auth, adminOnly, createTermCondition);
indexRoutes.get('/getallterms', getAllTermConditions);
indexRoutes.get('/getterms/:id', getTermConditionById);
indexRoutes.put('/updateterms/:id', auth, adminOnly, updateTermCondition);
indexRoutes.delete('/deleteterms/:id', auth, adminOnly, deleteTermCondition);

// faqs Routes
indexRoutes.post('/createfaq', auth, adminOnly, createFAQ);
indexRoutes.get('/getallfaqs', getAllFAQ);
indexRoutes.get('/getfaq/:id', getFAQById);
indexRoutes.put('/updatefaq/:id', auth, adminOnly, updateFAQ);
indexRoutes.delete('/deletetfaq/:id', auth, adminOnly, deleteFAQ);

// room type routes
indexRoutes.post('/roomtypes', createRoomType);
indexRoutes.get('/roomtypes', getRoomTypes);
indexRoutes.get('/roomtypes/:id', getRoomTypeById);
indexRoutes.put('/roomtypes/:id', updateRoomType);
indexRoutes.delete('/roomtypes/:id', deleteRoomType);

// feature routes
indexRoutes.post('/features', createFeature);
indexRoutes.get('/features', getFeatures);
indexRoutes.get('/features/roomtype/:roomTypeId', getFeaturesByRoomType);
indexRoutes.get('/features/:id', getFeatureById);
indexRoutes.put('/features/:id', updateFeature);
indexRoutes.delete('/features/:id', deleteFeature);

// room routes
indexRoutes.post('/rooms', auth, adminOnly, upload.array('images', 10), createRoom);
indexRoutes.get('/rooms', getRooms);
indexRoutes.get('/rooms/pagination', getRoomsWithPagination);
indexRoutes.get('/rooms/:id', getRoomById);
indexRoutes.put('/rooms/:id', auth, adminOnly, upload.array('images', 10), updateRoom);
indexRoutes.delete('/rooms/:id', auth, adminOnly, deleteRoom);
indexRoutes.post('/autoUpdateRoomBeds', autoUpdateRoomBeds);

// booking routes
indexRoutes.post('/bookings', auth, createBooking);
indexRoutes.get('/bookings', auth, getBookings);
indexRoutes.get('/bookings/:id', auth, getBookingById);
indexRoutes.put('/bookings/:id', auth, updateBooking);
indexRoutes.delete('/bookings/:id', auth, deleteBooking);

// ------------------------------- Cafe -------------------------------
// Cafe Category routes
indexRoutes.post('/createcafecategory', auth, adminOnly, createCafeCategory);
indexRoutes.get('/getallcafecategory', auth, adminOnly, getAllCafeCategories);
indexRoutes.get('/getcafecategory/:id', auth, adminOnly, getSingleCafeCategory);
indexRoutes.put('/updatecafecategory/:id', auth, adminOnly, updateCafeCategory);
indexRoutes.delete('/deletetcafecategory/:id', auth, adminOnly, deleteCafeCategory);

// Cafe Item routes
indexRoutes.post('/createcafeitem', auth, adminOnly, upload.single("image"), createCafeItem);
indexRoutes.get('/getallcafeitem', getAllCafeItems);
indexRoutes.get('/getcafeitem/:id', getSingleCafeItem);
indexRoutes.put('/updatecafeitem/:id', auth, adminOnly, upload.single("image"), updateCafeItem);
indexRoutes.delete('/deletetcafeitem/:id', auth, adminOnly, deleteCafeItem);

module.exports = indexRoutes;