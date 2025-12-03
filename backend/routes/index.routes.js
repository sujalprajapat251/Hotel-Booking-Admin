const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/imageUpload')
// const { createUser, userLogin, updateUser, changePassword, googleLogin, forgotPassword, verifyOtp, resetPassword } = require('../controller/userController');
// const { auth } = require('../middleware/auth');
const { createRoomType, getRoomTypes, getRoomTypeById, updateRoomType, deleteRoomType } = require('../controller/roomtypecontroller');
const { createFeature, getFeatures, getFeaturesByRoomType, getFeatureById, updateFeature, deleteFeature } = require('../controller/featuresController');
const { createUser, userLogin, updateUser, changePassword, googleLogin, forgotPassword, verifyOtp, resetPassword, resendOtp, getAllUsers, getUserById } = require('../controller/userController');
const { auth, adminOnly } = require('../middleware/auth');
const { createContact, getAllContact } = require('../controller/contactController');
const { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog, getBlogReadcountById, getBlogsByTag } = require('../controller/blogController');
const { createTermCondition, getAllTermConditions, getTermConditionById, updateTermCondition, deleteTermCondition } = require('../controller/termsController');
const { createFAQ, getAllFAQ, getFAQById, updateFAQ, deleteFAQ } = require('../controller/faqController');
const { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment } = require('../controller/departmentController');
const { createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff, getStaff, getAllHODStaff } = require('../controller/staffController');
const { createRoom, getRooms, getRoomById, updateRoom, deleteRoom, autoUpdateRoomBeds, getRoomsWithPagination, refreshAllRoomsStatus } = require('../controller/createRoomController');
const { createBooking, getBookings, getBookingById, updateBooking, deleteBooking, bookRoomByType } = require('../controller/bookingController');
const { createCafeCategory, getAllCafeCategories, getSingleCafeCategory, updateCafeCategory, deleteCafeCategory } = require('../controller/cafecategoryController');
const { createAbout, getAllAbout, getAboutById, updateAbout, deleteAbout } = require('../controller/aboutusController');
const { createCafeItem, getAllCafeItems, getSingleCafeItem, updateCafeItem, deleteCafeItem, changeAvailability } = require('../controller/cafeitemController');
const { deleteCafeTable, createTable, getTables, getTableById, updateTable, deleteTable } = require('../controller/cafeTableController');
const { createBarCategory, getSingleBarCategory, updateBarCategory, deleteBarCategory, getAllBarCategories } = require('../controller/barcategoryController');
const { createBarItem, getAllBarItems, getSingleBarItem, updateBarItem, deleteBarItem, changeAvailabilityBarItem } = require('../controller/baritemController');
const { createRestaurantCategory, getAllRestaurantCategories, getSingleRestaurantCategory, updateRestaurantCategory, deleteRestaurantCategory } = require('../controller/restaurantcategoryController');
const { createCafeOrder, addItemToTableOrder, removeItemFromOrder, getAllOrderItems, getAllCafeOrders, UpdateOrderItemStatus, getAllOrderItemsStatus, cafePayment, getAllCafeunpaid, getAllCafeOrdersByAdmin, getAllBarOrdersByAdmin, getAllRestaurantOrdersByAdmin } = require('../controller/adminOrderController');
const { createRestaurantItem, getAllRestaurantItems, getSingleRestaurantItem, updateRestaurantItem, deleteRestaurantItem, changeAvailabilityRestaurantItem } = require('../controller/restaurantitemController');
const { addCab, getAllCabs, getCabById, updateCab, deleteCab } = require('../controller/cabController');
const { createDriver, getAllDrivers, getDriverById, updateDriver, deleteDriver } = require('../controller/driverController');
const { createCabBooking, getAllCabBookings, getCabBookingById, updateCabBooking, deleteCabBooking, getCabBookingsByBookingId } = require('../controller/cabBookingController');
const { adminLogin, adminforgotPassword, adminverifyOtp, adminresendOtp, adminresetPassword, adminchangePassword } = require('../controller/adminController');
const { createReview, getAllReviews, getReviewById } = require('../controller/reviewController');
const { getDirtyRooms, assignWorker, startCleaning, completeCleaning, approveCleaning, getAllHousekeepignData, getWorkerTasks, getFreeWorkers } = require('../controller/housekeepingController');
const { getRevenueDashboard, dashboard, reservationDaywise, roomAvailability, getBookingTrends, orderDashboard, monthlyRevenue, serviceRequests } = require('../controller/dashboardController');
// const { getDirtyRooms, assignWorker, startCleaning, completeCleaning, approveCleaning, getAllHousekeepignData, getWorkerTasks } = require('../controller/housekeepingController');
const { addItemToRoomOrder, getOrdercafeByRoom,  getOrderbarByRoom,getOrderrestroByRoom, createOrPayOrder, createOrder, createOrderPaymentIntent } = require('../controller/userOrderController');
const { getPendingOrderRequests, getWorkerOrderRequests, assignWorkerToOrderRequest, advanceOrderRequestStatus } = require('../controller/orderRequestController');
const {  DepartmentDashboard, getDepartmentPaymentSummary, getDepartmentRevenueByMonth } = require('../controller/hoddashboardController');
const { getMyNotifications, markSeen, clearAll } = require('../controller/notificationController');

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
indexRoutes.put('/getblogreadcount/:id', getBlogReadcountById);
indexRoutes.get("/gettagblog/:tag", getBlogsByTag);

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
indexRoutes.post('/createstaff', auth, upload.single("image"), createStaff);
indexRoutes.get('/getallstaff', auth, adminOnly, getAllStaff);
indexRoutes.get('/getstaff', auth, getStaff);
indexRoutes.get('/getstaff/:id', auth, getStaffById);
indexRoutes.put('/updatestaff/:id', auth, upload.single("image"), updateStaff);
indexRoutes.delete('/deletetstaff/:id', auth, adminOnly, deleteStaff);
indexRoutes.get('/hod/getallstaff', auth, getAllHODStaff);

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
indexRoutes.post('/roomtypes', auth, adminOnly, createRoomType);
indexRoutes.get('/roomtypes', getRoomTypes);
indexRoutes.get('/roomtypes/:id', auth, adminOnly, getRoomTypeById);
indexRoutes.put('/roomtypes/:id', auth, adminOnly, updateRoomType);
indexRoutes.delete('/roomtypes/:id', auth, adminOnly, deleteRoomType);

// feature routes
indexRoutes.post('/features', auth, adminOnly, createFeature);
indexRoutes.get('/features', getFeatures);
indexRoutes.get('/features/roomtype/:roomTypeId', auth, adminOnly, getFeaturesByRoomType);
indexRoutes.get('/features/:id', auth, adminOnly, getFeatureById);
indexRoutes.put('/features/:id', auth, adminOnly, updateFeature);
indexRoutes.delete('/features/:id', auth, adminOnly, deleteFeature);

// room routes
indexRoutes.post('/rooms', auth, adminOnly, upload.array('images', 10), createRoom);
indexRoutes.get('/rooms', getRooms);
indexRoutes.get('/rooms/pagination', getRoomsWithPagination);
indexRoutes.get('/rooms/:id', getRoomById);
indexRoutes.put('/rooms/:id', auth, adminOnly, upload.array('images', 10), updateRoom);
indexRoutes.delete('/rooms/:id', auth, adminOnly, deleteRoom);
indexRoutes.post('/autoUpdateRoomBeds', autoUpdateRoomBeds);
indexRoutes.post('/rooms/refresh-status', refreshAllRoomsStatus);

// booking routes
indexRoutes.post('/bookings', auth, createBooking);
indexRoutes.get('/bookings', getBookings);
indexRoutes.get('/bookings/:id', getBookingById);
indexRoutes.put('/bookings/:id', auth, updateBooking);
indexRoutes.delete('/bookings/:id', auth, deleteBooking);
indexRoutes.post('/bookRoomByType', auth, bookRoomByType);


// Housekeeping Route
indexRoutes.get('/getallhousekeepingroom', auth, getDirtyRooms);
indexRoutes.post('/assign', auth, assignWorker);
indexRoutes.put('/start/:id', startCleaning);
indexRoutes.put('/complete/:id', auth, completeCleaning);
indexRoutes.put('/approve/:roomId', auth, approveCleaning);
indexRoutes.get('/getallhousekeeping', auth, getAllHousekeepignData);
indexRoutes.get('/getworkertask/:workerId', auth, getWorkerTasks);
indexRoutes.get('/getfreeworker', auth, getFreeWorkers);

// ------------------------------- Cafe -------------------------------
// Cafe Category routes
indexRoutes.post('/createcafecategory', auth, adminOnly, createCafeCategory);
indexRoutes.get('/getallcafecategory', getAllCafeCategories);
indexRoutes.get('/getcafecategory/:id', getSingleCafeCategory);
indexRoutes.put('/updatecafecategory/:id', auth, adminOnly, updateCafeCategory);
indexRoutes.delete('/deletetcafecategory/:id', auth, adminOnly, deleteCafeCategory);

// Cafe Item routes
indexRoutes.post('/createcafeitem', auth, adminOnly, upload.single("image"), createCafeItem);
indexRoutes.get('/getallcafeitem', getAllCafeItems);
indexRoutes.get('/getcafeitem/:id', getSingleCafeItem);
indexRoutes.put('/updatecafeitem/:id', auth, adminOnly, upload.single("image"), updateCafeItem);
indexRoutes.delete('/deletetcafeitem/:id', auth, adminOnly, deleteCafeItem);
indexRoutes.put('/togglecafeitem/:id', auth, adminOnly, changeAvailability);

// cafe table Routes 
indexRoutes.post('/addTable', auth, createTable)
indexRoutes.get('/getAllTable', auth, getTables)
indexRoutes.get('/getTable/:id', auth, getTableById)
indexRoutes.put('/updateTable/:id', auth, updateTable)
indexRoutes.delete('/deleteTable/:id', auth, deleteTable)
// indexRoutes.get('/getAllTable',auth,getTables)
// indexRoutes.get('/getTable/:id',auth,getTableById)
// indexRoutes.put('/updateTable/:id',auth,updateTable)
// indexRoutes.delete('/deleteTable/:id',auth,deleteTable)

// Generic HOD table management
indexRoutes.get('/tables', auth, getTables)
indexRoutes.get('/tables/:id', auth, getTableById)
indexRoutes.put('/tables/:id', auth, updateTable)
indexRoutes.delete('/tables/:id', auth, deleteTable)

// ------------------------------- Bar -------------------------------
// Bar Category routes
indexRoutes.post('/createbarcategory', auth, adminOnly, createBarCategory);
indexRoutes.get('/getallbarcategory', getAllBarCategories);
indexRoutes.get('/getbarcategory/:id', getSingleBarCategory);
indexRoutes.put('/updatebarcategory/:id', auth, adminOnly, updateBarCategory);
indexRoutes.delete('/deletetbarcategory/:id', auth, adminOnly, deleteBarCategory);

// Bar Item routes
indexRoutes.post('/createbaritem', auth, adminOnly, upload.single("image"), createBarItem);
indexRoutes.get('/getallbaritem', getAllBarItems);
indexRoutes.get('/getbaritem/:id', getSingleBarItem);
indexRoutes.put('/updatebaritem/:id', auth, adminOnly, upload.single("image"), updateBarItem);
indexRoutes.delete('/deletetbaritem/:id', auth, adminOnly, deleteBarItem);
indexRoutes.put('/togglebaritem/:id', auth, adminOnly, changeAvailabilityBarItem);

// ------------------------------- Restaurant -------------------------------
// Restaurant Category routes
indexRoutes.post('/createrestaurantcategory', auth, adminOnly, createRestaurantCategory);
indexRoutes.get('/getallrestaurantcategory', getAllRestaurantCategories);
indexRoutes.get('/getrestaurantcategory/:id', getSingleRestaurantCategory);
indexRoutes.put('/updaterestaurantcategory/:id', auth, adminOnly, updateRestaurantCategory);
indexRoutes.delete('/deletetrestaurantcategory/:id', auth, adminOnly, deleteRestaurantCategory);

// Restaurant Item routes
indexRoutes.post('/createrestaurantitem', auth, adminOnly, upload.single("image"), createRestaurantItem);
indexRoutes.get('/getallrestaurantitem', getAllRestaurantItems);
indexRoutes.get('/getrestaurantitem/:id', getSingleRestaurantItem);
indexRoutes.put('/updaterestaurantitem/:id', auth, adminOnly, upload.single("image"), updateRestaurantItem);
indexRoutes.delete('/deletetrestaurantitem/:id', auth, adminOnly, deleteRestaurantItem);
indexRoutes.put('/togglerestaurantitem/:id', auth, adminOnly, changeAvailabilityRestaurantItem);

// Cab routes
indexRoutes.post('/createcab', auth, adminOnly, upload.single("cabImage"), addCab);
indexRoutes.get('/getallcab', getAllCabs);
indexRoutes.get('/getcab/:id', getCabById);
indexRoutes.put('/updatecab/:id', auth, adminOnly, upload.single("cabImage"), updateCab);
indexRoutes.delete('/deletecab/:id', auth, adminOnly, deleteCab);

// Driver routes
indexRoutes.post('/createdriver', auth, adminOnly, upload.single("image"), createDriver);
indexRoutes.get('/getalldriver', getAllDrivers);
indexRoutes.get('/getdriver/:id', getDriverById);
indexRoutes.put('/updatedriver/:id', auth, adminOnly, upload.single("image"), updateDriver);
indexRoutes.delete('/deletetdriver/:id', auth, adminOnly, deleteDriver);

// Cab Booking routes
indexRoutes.post('/createcabbooking', auth, createCabBooking);
indexRoutes.get('/getallcabbooking', getAllCabBookings);
indexRoutes.get('/getcabbooking/:id', getCabBookingById);
indexRoutes.put('/updatecabbooking/:id', auth, updateCabBooking);
indexRoutes.delete('/deletecabbooking/:id', auth, deleteCabBooking);
indexRoutes.get('/getcabbookingsbybooking/:bookingId', getCabBookingsByBookingId);

// Review routes
indexRoutes.post('/reviews', auth, createReview);
indexRoutes.get('/reviews', getAllReviews);
indexRoutes.get('/reviews/:id', getReviewById);

// indexRoutes.post('/addCafeOrder',createCafeOrder)
// admin side api 
indexRoutes.get('/getCafeOrder', auth, getAllCafeOrders)
indexRoutes.get('/getCafeOrderitems/:status', getAllOrderItemsStatus)
indexRoutes.get('/getCafeOrderitems', auth, getAllOrderItems)
indexRoutes.post('/CafeItemStatus', auth, UpdateOrderItemStatus);
indexRoutes.post('/cafe/tables/:tableId/order/items', auth, addItemToTableOrder)
indexRoutes.delete('/cafe/orders/:id/items/:itemId', auth, removeItemFromOrder)
indexRoutes.post('/cafePayment/:orderId', auth, cafePayment)
indexRoutes.get('/cafeUnpaidOrder', auth, getAllCafeunpaid)
indexRoutes.get('/getallcafeorderbyadmin', auth, adminOnly, getAllCafeOrdersByAdmin);
indexRoutes.get('/getallbarorderbyadmin', auth, adminOnly, getAllBarOrdersByAdmin);
indexRoutes.get('/getallrestaurantorderbyadmin', auth, adminOnly, getAllRestaurantOrdersByAdmin);


// user side order api 
indexRoutes.post('/createOrder', auth, createOrder);
indexRoutes.post('/paymentintent',createOrderPaymentIntent)
indexRoutes.get('/mycafeorder/:roomId', auth, getOrdercafeByRoom);
indexRoutes.get('/mybarorder/:roomId', auth, getOrderbarByRoom);
indexRoutes.get('/myrestaurantorder/:roomId', auth, getOrderrestroByRoom);

// order request api 
indexRoutes.get('/getorderRequest', getPendingOrderRequests)
indexRoutes.get('/getorderRequest/:workerId', getWorkerOrderRequests)
indexRoutes.put('/orderRequest/:id/assign', auth, assignWorkerToOrderRequest)
indexRoutes.put('/orderRequest/:id/status', auth, advanceOrderRequestStatus)

// admin login routes 
indexRoutes.post('/adminlogin', adminLogin);
indexRoutes.post('/adminforgotPassword', adminforgotPassword);
indexRoutes.post('/adminverifyOtp', adminverifyOtp)
indexRoutes.post("/adminresendOtp", adminresendOtp);
indexRoutes.post('/adminresetpassword', adminresetPassword);
indexRoutes.put('/adminchangePassword', auth, adminchangePassword);

// Dashboard Routes
indexRoutes.get('/getrevenue', auth, adminOnly, getRevenueDashboard);
indexRoutes.get("/roomavailability", auth, adminOnly, roomAvailability);
indexRoutes.get('/getreservation', auth, adminOnly, reservationDaywise);
indexRoutes.get('/getbookingtrends', auth, adminOnly, getBookingTrends);
indexRoutes.get('/getdashboard', auth, adminOnly, dashboard);
indexRoutes.get('/getoccupancyrate', auth, adminOnly, monthlyRevenue);
indexRoutes.get('/getordersummery', auth, adminOnly, orderDashboard);
indexRoutes.get('/servicerequests', auth, adminOnly, serviceRequests);

// HOD Dashboard Routes
indexRoutes.get('/gethoddashboard', auth, DepartmentDashboard);
indexRoutes.get('/getdepartmentpaymentsummary', auth, getDepartmentPaymentSummary);
indexRoutes.get('/getdepartmentrevenuebymonth', auth, getDepartmentRevenueByMonth);

// Notifications
indexRoutes.get('/notifications', auth, getMyNotifications);
indexRoutes.put('/notifications/:id/seen', auth, markSeen);
indexRoutes.delete('/notifications', auth, clearAll);


module.exports = indexRoutes;
