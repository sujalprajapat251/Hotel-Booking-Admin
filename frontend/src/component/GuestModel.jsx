import React, { useMemo, useState, useEffect, useRef } from "react";
import { ConfigProvider, DatePicker } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { createBooking, createBookingPaymentIntent } from "../Redux/Slice/bookingSlice";
import { createCabBooking, getAllCabBookings } from "../Redux/Slice/cabBookingSlice";
import * as Yup from "yup";
import { useFormik } from "formik";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ChevronDown } from "lucide-react";
import { getAllCabs } from "../Redux/Slice/cab.slice";
// Helper to calculate number of nights
function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = outDate - inDate;
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

const GuestModal = ({ onClose, room, onBooked }) => {
  const { RangePicker } = DatePicker;
  const dispatch = useDispatch();
  const { creating, error } = useSelector((state) => state.booking || {});
  const { loading: cabBookingLoading } = useSelector((state) => state.cabBooking || {});
  const [activeTab, setActiveTab] = useState("personal");
  const [cabServiceEnabled, setCabServiceEnabled] = useState(false);
  const [showPaymentStatusDropdown, setShowPaymentStatusDropdown] = useState(false);
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);
  const [showPickUpDropdown, setShowPickUpDropdown] = useState(false);
  const [showSeatingDropdown, setShowSeatingDropdown] = useState(false);
  const paymentStatusRef = useRef(null);
  const paymentMethodRef = useRef(null);
  const pickUpRef = useRef(null);
  const seatingRef = useRef(null);
  const { cabs } = useSelector((state) => state.cab || { cabs: [] });
  // Prefer room type price, then room base price, fallback 0
  const roomPrice = room?.roomType?.price ?? room?.price?.base ?? 0;
  const validationSchema = useMemo(() => {
    const baseSchema = {
      fullName: Yup.string().trim().required("Full name is required"),
      email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
      countrycode: Yup.string().trim().required("Country code is required"),
      mobile: Yup.string().trim().required("Phone number is required"),
      address: Yup.string().trim().required("Address is required"),
      checkInDate: Yup.string().required("Check-in date is required"),
      checkOutDate: Yup.string().required("Check-out date is required"),
      paymentStatus: Yup.string().required("Payment status is required"),
      paymentMethod: Yup.string().required("Payment method is required"),
      totalAmount: Yup.number().min(0, "Total cannot be negative").required("Total amount is required"),
      idNumber: Yup.string().trim().required("ID number is required"),
    };

    if (cabServiceEnabled) {
      return Yup.object().shape({
        ...baseSchema,
        pickUpLocation: Yup.string().required("Pick-up location is required"),
        pickUpTime: Yup.string().required("Pick-up time is required"),
        preferredSeatingCapacity: Yup.string().required("Seating capacity is required"),
      });
    }
    return Yup.object().shape(baseSchema);
  }, [cabServiceEnabled]);

  const {
    values: formState,
    errors,
    setFieldValue,
    setValues,
    handleSubmit,
    setFieldTouched,
    validateForm,
  } = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      countrycode: "+91",
      mobile: "",
      fullMobile: "",
      idNumber: "",
      address: "",
      checkInDate: "",
      checkOutDate: "",
      paymentStatus: "Pending",
      paymentMethod: "Cash",
      paymentIntentId: "",
      totalAmount: roomPrice || "",
      notes: "",
      pickUpLocation: "Airport",
      pickUpTime: "",
      bookingDate: "",
      preferredSeatingCapacity: "4",
      estimatedDistance: "",
      estimatedFare: "",
      specialInstructions: "",
      cabNotes: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: false,
    onSubmit: async (submittedValues, helpers) => {
      if (!room?.id) return;

      // Ensure phone exists
      if (!submittedValues.countrycode || !submittedValues.mobile) {
        helpers.setFieldError("mobile", "Please enter a valid mobile number with country code");
        setActiveTab("personal");
        return;
      }

      try {
        // Only create booking intent for Card or Bank Transfer
        let paymentIntentId = "";
        const paymentMethod = (submittedValues.paymentMethod || "").toLowerCase();
        if (paymentMethod === "card" || paymentMethod === "bank transfer" || paymentMethod === "bank_transfer") {
          const paymentIntent = await dispatch(
            createBookingPaymentIntent({ totalAmount: submittedValues.totalAmount, currency: "usd" })
          ).unwrap();
          if (!paymentIntent) {
            throw new Error("Failed to create payment intent.");
          }
          paymentIntentId = paymentIntent;
        }

        const payload = {
          roomId: room.id,
          guest: {
            fullName: submittedValues.fullName,
            email: submittedValues.email,
            countrycode: submittedValues.countrycode,
            phone: submittedValues.mobile,
            idNumber: submittedValues.idNumber,
            address: submittedValues.address,
          },
          reservation: {
            checkInDate: submittedValues.checkInDate,
            checkOutDate: submittedValues.checkOutDate,
            occupancy: {
              adults: room?.capacity?.adults || 1,
              children: room?.capacity?.children || 0,
            },
          },
          payment: {
            paymentIntentId: paymentIntentId,
            status: submittedValues.paymentStatus,
            totalAmount: Number(submittedValues.totalAmount || room?.price?.base || 0),
            method: submittedValues.paymentMethod,
          },
          status: "Confirmed",
          notes: submittedValues.notes,
        };

        const bookingResult = await dispatch(createBooking(payload)).unwrap();

        if (cabServiceEnabled) {
          const bookingId = bookingResult?.id || bookingResult?._id;
          if (!bookingId) {
            throw new Error("Failed to get booking ID for cab booking");
          }
          const cabBookingPayload = {
            bookingId,
            pickUpLocation: submittedValues.pickUpLocation,
            pickUpTime: submittedValues.pickUpTime,
            bookingDate: submittedValues.bookingDate || submittedValues.checkInDate || new Date().toISOString().split("T")[0],
            preferredSeatingCapacity: submittedValues.preferredSeatingCapacity || "4",
            estimatedDistance: submittedValues.estimatedDistance ? Number(submittedValues.estimatedDistance) : null,
            estimatedFare: submittedValues.estimatedFare ? Number(submittedValues.estimatedFare) : null,
            specialInstructions: submittedValues.specialInstructions || "",
            notes: submittedValues.cabNotes || "",
          };
          await dispatch(createCabBooking(cabBookingPayload)).unwrap();
        }
        if (onBooked) {
          onBooked(room);
        }
        onClose();
      } catch (err) {
        console.error("Error creating booking or cab booking:", err);
        setActiveTab("personal");
      }
    },
  });

  // Fetch cabs on component mount
  useEffect(() => {
    dispatch(getAllCabBookings());
    dispatch(getAllCabs());
  }, [dispatch]);



  // Helper function to get perKmCharge based on seating capacity
  const getPerKmCharge = (seatingCapacity) => {
    if (!seatingCapacity || !cabs || cabs.length === 0) {
      return 20; // Default fallback value
    }

    const capacityNumber = seatingCapacity === "10+" ? 10 : parseInt(seatingCapacity);

    // First, try to find exact match
    const exactMatch = cabs.find(cab => cab.seatingCapacity === seatingCapacity && cab.status === "Available");
    if (exactMatch && exactMatch.perKmCharge) {
      return exactMatch.perKmCharge;
    }

    // If no exact match, find cabs with equal or higher capacity
    if (!isNaN(capacityNumber)) {
      const suitableCabs = cabs 
        .filter(cab => {
          if (cab.seatingCapacity === "10+") return true;
          const cabCapacity = parseInt(cab.seatingCapacity);
          return !isNaN(cabCapacity) && cabCapacity >= capacityNumber && cab.status === "Available";
        })
        .sort((a, b) => {
          // Sort by capacity ascending to get the smallest suitable cab
          const aCap = a.seatingCapacity === "10+" ? 999 : parseInt(a.seatingCapacity);
          const bCap = b.seatingCapacity === "10+" ? 999 : parseInt(b.seatingCapacity);
          return aCap - bCap;
        });

      if (suitableCabs.length > 0 && suitableCabs[0].perKmCharge) {
        return suitableCabs[0].perKmCharge;
      }
    }

    // Fallback: use first available cab's perKmCharge or default
    const firstAvailableCab = cabs.find(cab => cab.status === "Available" && cab.perKmCharge);
    return firstAvailableCab?.perKmCharge || 20;
  };

  const PICKUP_DISTANCE_MAP = {
    Airport: "30",
    "Railway Station": "15",
    "Bus Station": "20",
  };

  // Get current CAB_FARE_RATE based on selected seating capacity
  const CAB_FARE_RATE = useMemo(() => {
    return getPerKmCharge(formState.preferredSeatingCapacity);
  }, [formState.preferredSeatingCapacity, cabs]);
  // Seating options derived from cab data; fallback to defaults
  const seatingOptions = useMemo(() => {
    const available = (cabs || [])
      .filter((cab) => cab?.seatingCapacity && cab.status === "Available")
      .map((cab) => String(cab.seatingCapacity));

      
      
      // Ensure uniqueness
      const unique = Array.from(new Set(available));
      // Sort numerically, keeping "10+" at the end
      return unique.sort((a, b) => {
        const aVal = a === "10+" ? 999 : parseInt(a, 10);
        const bVal = b === "10+" ? 999 : parseInt(b, 10);
        return aVal - bVal;
      });
    }, [cabs]);
  const inputClasses =
    "w-full border border-tertiary/40 rounded-lg p-2 bg-white/95 text-senary placeholder:text-quinary/60 focus:outline-none focus:ring-2 focus:ring-quaternary/40 focus:border-quaternary/60 transition";
  const textareaClasses = `${inputClasses} h-24`;

  // Auto-set estimated distance based on static pick-up location mapping
  useEffect(() => {
    if (!cabServiceEnabled) return;
    const mappedDistance = PICKUP_DISTANCE_MAP[formState.pickUpLocation];
    if (mappedDistance !== undefined && `${formState.estimatedDistance}` !== `${mappedDistance}`) {
      setValues((prev) => ({
        ...prev,
        estimatedDistance: mappedDistance,
      }));
    }
  }, [formState.pickUpLocation, cabServiceEnabled, PICKUP_DISTANCE_MAP, setValues, formState.estimatedDistance]);

  // Automatically update estimated fare when distance changes
  useEffect(() => {
    if (cabServiceEnabled && formState.estimatedDistance) {
      const fare = parseFloat(formState.estimatedDistance) * CAB_FARE_RATE;
      setValues((prev) => ({
        ...prev,
        estimatedFare: fare ? fare.toFixed(2) : "",
      }));
    } else if (!formState.estimatedDistance) {
      setValues((prev) => ({
        ...prev,
        estimatedFare: "",
      }));
    }
  }, [formState.estimatedDistance, cabServiceEnabled, CAB_FARE_RATE, setValues, formState.preferredSeatingCapacity]);

  // Recalculate totalAmount whenever stay dates or price changes
  useEffect(() => {
    const nights = getNights(formState.checkInDate, formState.checkOutDate);
    const pricePerNight = roomPrice;
    const roomTotal = nights * pricePerNight;
    const cabCharge = cabServiceEnabled && formState.estimatedFare ? parseFloat(formState.estimatedFare) : 0;
    const total = roomTotal + cabCharge;
    setValues((prev) => ({
      ...prev,
      totalAmount: total > 0 ? total : "",
    }));
  }, [formState.checkInDate, formState.checkOutDate, room, formState.estimatedFare, cabServiceEnabled, roomPrice, setValues]);


  const roomSummary = useMemo(() => {
    if (!room) return null;
    const bed = room?.bed?.mainBed?.type ? `${room.bed.mainBed.type} bed` : null;
    const capacity =
      (room?.capacity?.adults || 0) + (room?.capacity?.children || 0);
    return {
      label: `Room ${room.roomNumber}`,
      type: room.roomType?.roomType || "Room",
      bed,
      capacity,
      price: roomPrice,
    };
  }, [room, roomPrice]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentStatusRef.current && !paymentStatusRef.current.contains(event.target)) {
        setShowPaymentStatusDropdown(false);
      }
      if (paymentMethodRef.current && !paymentMethodRef.current.contains(event.target)) {
        setShowPaymentMethodDropdown(false);
      }
      if (pickUpRef.current && !pickUpRef.current.contains(event.target)) {
        setShowPickUpDropdown(false);
      }
      if (seatingRef.current && !seatingRef.current.contains(event.target)) {
        setShowSeatingDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-set booking date and pick-up time when check-in date changes (if cab service is enabled)
  useEffect(() => {
    if (cabServiceEnabled && formState.checkInDate) {
      setValues((prev) => ({
        ...prev,
        bookingDate: prev.bookingDate || prev.checkInDate,
        pickUpTime: prev.pickUpTime || (prev.checkInDate ? `${prev.checkInDate}T10:00` : ""),
      }));
    }
  }, [formState.checkInDate, cabServiceEnabled, setValues]);

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const dateRangeValue = useMemo(() => {
    const start = formState.checkInDate ? dayjs(formState.checkInDate) : null;
    const end = formState.checkOutDate ? dayjs(formState.checkOutDate) : null;
    return [start, end];
  }, [formState.checkInDate, formState.checkOutDate]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = await validateForm();
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const reservationFields = ["checkInDate", "checkOutDate", "pickUpLocation", "pickUpTime", "preferredSeatingCapacity", "totalAmount"];
      const hasReservationError = Object.keys(validationErrors).some((key) => reservationFields.includes(key));
      setActiveTab(hasReservationError ? "reservation" : "personal");
      return;
    }
    handleSubmit(event);
  };

  const handleChange = (field) => (event) => {
    const { value, type, checked } = event.target;
    if (type === "checkbox") {
      setCabServiceEnabled(checked);
      // Reset cab booking fields when unchecked
      if (!checked) {
        setValues((prev) => ({
          ...prev,
          pickUpLocation: "Airport",
          pickUpTime: "",
          bookingDate: "",
          preferredSeatingCapacity: "4",
          estimatedDistance: "",
          estimatedFare: "",
          specialInstructions: "",
          cabNotes: "",
        }));
      } else {
        // Auto-set booking date and pick-up time when enabling cab service
        setValues((prev) => ({
          ...prev,
          bookingDate: prev.bookingDate || prev.checkInDate || "",
          pickUpTime: prev.pickUpTime || (prev.checkInDate ? `${prev.checkInDate}T10:00` : ""),
        }));
      }
    } else {
      setFieldValue(field, value);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length === 0) {
      setValues((prev) => ({
        ...prev,
        checkInDate: "",
        checkOutDate: "",
      }));
      return;
    }

    const [start, end] = dates;
    setValues((prev) => ({
      ...prev,
      checkInDate: start ? start.format("YYYY-MM-DD") : "",
      checkOutDate: end ? end.format("YYYY-MM-DD") : "",
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        className="bg-white w-[90%] md:w-[80%] lg:w-[70%] rounded-lg  shadow-[0_25px_60px_rgba(117,86,71,0.25)] border border-primary/40 backdrop-blur-md"
        onSubmit={handleFormSubmit}      >
        {/* HEADER */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-3 sm:px-4 py-3 sm:py-4 rounded-t-lg">
          <div>
            <h2 className="text-xl font-semibold text-black">Add New Guest</h2>
            {roomSummary && (
              <p className="text-sm text-gray-600">
                {roomSummary.label} • {roomSummary.type}
                {roomSummary.bed ? ` • ${roomSummary.bed}` : ""} • Sleeps{" "}
                {roomSummary.capacity}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-3xl leading-none hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-primary/40 bg-primary/20">
          <button
            type="button"
            className={`flex-1 text-center py-3 px-3 font-medium transition ${activeTab === "personal"
                ? "border-b-4 border-senary bg-white text-senary shadow-inner"
                : "text-quinary hover:bg-primary/30"
              }`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Information
          </button>

          <button
            type="button"
            className={`flex-1 text-center py-3 px-3 font-medium transition ${activeTab === "reservation"
                ? "border-b-4 border-senary bg-white text-senary shadow-inner"
                : "text-quinary hover:bg-primary/30"
              }`}
            onClick={() => setActiveTab("reservation")}
          >
            Reservation Details
          </button>
        </div>

        {/* ALERT */}
        {error && (
          <div className="px-6 py-3 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* CONTENT */}
        <div className="p-3 sm:p-4 md:p-5 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {/* PERSONAL TAB */}
          {activeTab === "personal" && (
            <div>
              <h3 className="text-lg font-semibold border-l-4 border-senary pl-2 mb-4 text-senary">
                Personal Details
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name*</label>
                <input
                  type="text"
                  className="w-full text-black px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] border-gray-300"
                  placeholder="Enter full name"
                  value={formState.fullName}
                  onChange={handleChange("fullName")}
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full text-black px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] border-gray-300"
                  placeholder="Enter email"
                  value={formState.email}
                  onChange={handleChange("email")}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number*</label>
                  <PhoneInput
                    country={"in"}
                    enableSearch={true}
                    value={formState.fullMobile || ""}
                    onChange={(value, country) => {
                      const nextValue = value || "";
                      const dialCode = country?.dialCode || "";
                      const mobileOnly = nextValue.slice(dialCode.length);

                    setValues((prev) => ({
                      ...prev,
                      countrycode: dialCode ? `+${dialCode}` : "",
                      mobile: mobileOnly,
                      fullMobile: nextValue,
                    }));
                    }}
                    placeholder="Enter mobile number"
                    inputProps={{
                      name: "mobile",
                      required: true,
                    }}
                    containerStyle={{
                      width: "100%",
                    }}
                    buttonStyle={{
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      width: "50px",
                    }}
                    inputStyle={{
                      width: "100%",
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      paddingLeft: "55px",
                      height: "42px",
                    }}
                    dropdownStyle={{
                      width: "260px",
                    }}
                  />
                  {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ID Number</label>
                  <input
                    type="text"
                    className="w-full text-black px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] border-gray-300"
                    placeholder="ID number"
                    value={formState.idNumber}
                    onChange={handleChange("idNumber")}
                  />
                  {errors.idNumber && <p className="text-xs text-red-600 mt-1">{errors.idNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address*</label>
                <textarea
                  className="w-full text-black px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] border-gray-300"
                  placeholder="Enter address"
                  value={formState.address}
                  onChange={handleChange("address")}
                ></textarea>
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>
            </div>
          )}

          {/* RESERVATION TAB */}
          {activeTab === "reservation" && (
            <div>
              <h3 className="text-lg font-semibold border-l-4 border-senary pl-2 mb-4 text-senary">
                Booking Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stay Dates*</label>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorPrimary: "#A3876A",
                        borderRadius: 12,
                        controlHeight: 44,
                      },
                      components: {
                        DatePicker: {
                          colorBgContainer: "#755647",
                          colorText: "#F7DF9C",
                          colorTextPlaceholder: "#E3C78A",
                          colorTextDisabled: "#B79982",
                          cellActiveWithRangeBg: "#A3876A",
                          cellRangeBg: "#876B56",
                          cellRangeHoverBg: "#B79982",
                          colorSplit: "#B79982",
                        },
                      },
                    }}
                  >
                    <RangePicker
                      className="guest-range-picker w-full h-11"
                      value={dateRangeValue}
                      onChange={handleDateRangeChange}
                      format="DD/MM/YYYY"
                      allowClear
                      inputReadOnly
                      placeholder={["DD/MM/YYYY", "DD/MM/YYYY"]}
                      popupClassName="guest-range-dropdown"
                    />
                  </ConfigProvider>
                  {errors.checkInDate && <p className="text-xs text-red-600 mt-1">{errors.checkInDate}</p>}
                  {errors.checkOutDate && !errors.checkInDate && <p className="text-xs text-red-600 mt-1">{errors.checkOutDate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
                  <div className="relative" ref={paymentStatusRef}>
                    <button
                      type="button"
                      className="w-full text-left text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6] flex items-center justify-between"
                      onClick={() => setShowPaymentStatusDropdown((prev) => !prev)}
                    >
                      <span className={formState.paymentStatus ? 'text-gray-800' : 'text-gray-400'}>
                        {formState.paymentStatus || 'Select payment status'}
                      </span>
                      <ChevronDown size={18} className="text-gray-600 ml-2" />
                    </button>
                    {showPaymentStatusDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-48 overflow-y-auto">
                        <div
                          onClick={() => {
                            setFieldValue("paymentStatus", "Pending");
                            setShowPaymentStatusDropdown(false);
                          }}
                          className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                        >
                          Pending
                        </div>
                        <div
                          onClick={() => {
                            setFieldValue("paymentStatus", "Paid");
                            setShowPaymentStatusDropdown(false);
                          }}
                          className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                        >
                          Paid
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cab Service Checkbox */}
              <div className="mt-4 px-4 py-3 w-full text-black border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] border-gray-300">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cabServiceEnabled}
                    onChange={handleChange("cabService")}
                    className="w-5 h-5 text-senary border-quaternary rounded focus:ring-senary/40 focus:outline-none"
                  />
                  <span className="ml-2 text-sm font-medium text-black">
                    Add Cab Service
                  </span>
                </label>
              </div>

              {/* Cab Booking Details - Show only if checkbox is checked */}
              {cabServiceEnabled && (
                <div className="mt-4 p-3 sm:p-4 border border-gray-200 rounded-md shadow-sm">
                  <h4 className="text-md font-semibold border-l-4 border-senary pl-2 mb-4 text-senary">
                    Cab Booking Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pick-up Location*</label>
                      <div className="relative" ref={pickUpRef}>
                        <button
                          type="button"
                          className="w-full text-left text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6] flex items-center justify-between"
                          onClick={() => setShowPickUpDropdown((prev) => !prev)}
                        >
                          <span className={formState.pickUpLocation ? 'text-gray-800' : 'text-gray-400'}>
                            {formState.pickUpLocation || 'Select pick-up location'}
                          </span>
                          <ChevronDown size={18} className="text-gray-600 ml-2" />
                        </button>
                        {showPickUpDropdown && (
                          <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-48 overflow-y-auto">
                            <div
                              onClick={() => {
                                setFieldValue("pickUpLocation", "Airport");
                                setShowPickUpDropdown(false);
                              }}
                              className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                            >
                              Airport
                            </div>
                            <div
                              onClick={() => {
                                setFieldValue("pickUpLocation", "Railway Station");
                                setShowPickUpDropdown(false);
                              }}
                              className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                            >
                              Railway Station
                            </div>
                            <div
                              onClick={() => {
                                setFieldValue("pickUpLocation", "Bus Station");
                                setShowPickUpDropdown(false);
                              }}
                              className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                            >
                              Bus Station
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.pickUpLocation && <p className="text-xs text-red-600 mt-1">{errors.pickUpLocation}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pick-up Time*</label>
                      <input
                        type="datetime-local"
                        className="w-full text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6]"
                        required={cabServiceEnabled}
                        value={formState.pickUpTime}
                        onChange={handleChange("pickUpTime")}
                      />
                      {errors.pickUpTime && <p className="text-xs text-red-600 mt-1">{errors.pickUpTime}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Seating Capacity*</label>
                      <div className="relative" ref={seatingRef}>
                        <button
                          type="button"
                          className="w-full text-left text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6] flex items-center justify-between"
                          onClick={() => setShowSeatingDropdown((prev) => !prev)}
                        >
                          <span className={formState.preferredSeatingCapacity ? 'text-gray-800' : 'text-gray-400'}>
                            {formState.preferredSeatingCapacity ? `${formState.preferredSeatingCapacity} Seater` : 'Select seating capacity'}
                          </span>
                          <ChevronDown size={18} className="text-gray-600 ml-2" />
                        </button>
                        {showSeatingDropdown && (
                          <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-48 overflow-y-auto">
                            {seatingOptions.map((val) => (
                              <div
                                key={val}
                                onClick={() => {
                                  setFieldValue("preferredSeatingCapacity", val);
                                  setShowSeatingDropdown(false);
                                }}
                                className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                              >
                                {val === '10+' ? '10+ Seater' : `${val} Seater`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        A cab with matching or higher capacity will be automatically assigned
                      </p>
                      {errors.preferredSeatingCapacity && <p className="text-xs text-red-600 mt-1">{errors.preferredSeatingCapacity}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Date</label>
                      <input
                        type="date"
                        className="w-full text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6]"
                        value={formState.bookingDate}
                        onChange={handleChange("bookingDate")}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Distance (km)</label>
                      <input
                        type="number"
                        className="w-full text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6]"
                        placeholder="0"
                        min="0"
                        step="0.1"
                        value={formState.estimatedDistance}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Fare</label>
                      <input
                        type="number"
                        className="w-full text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6]"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={formState.estimatedFare}
                        readOnly // Make field read-only so it cannot be edited by user
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                    <textarea
                      className="w-full text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6]"
                      placeholder="Any special instructions for the driver"
                      value={formState.specialInstructions}
                      onChange={handleChange("specialInstructions")}
                    ></textarea>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cab Booking Notes</label>
                    <textarea
                      className="w-full text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6]"
                      placeholder="Additional notes for cab booking"
                      value={formState.cabNotes}
                      onChange={handleChange("cabNotes")}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              <div className="mt-4 p-4 rounded-md border border-primary/20 bg-[#FFFAEB]">
                <h4 className="font-semibold text-md mb-2 text-senary">Booking Summary</h4>
                <div className="flex flex-col gap-1 text-sm">
                  <span>Room Total: <b>${getNights(formState.checkInDate, formState.checkOutDate) * roomPrice}</b></span>
                  <span>Cab Charges: <b>${cabServiceEnabled && formState.estimatedFare ? formState.estimatedFare : 0}</b></span>
                  <span className="border-t border-quinary/20 pt-1 mt-1">Total Amount: <b>${formState.totalAmount}</b></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  {/* Custom Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full text-left text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6] flex items-center justify-between"
                      onClick={() => setShowPaymentMethodDropdown((prev) => !prev)}
                    >
                      <span className={formState.paymentMethod ? 'text-gray-800' : 'text-gray-400'}>
                        {formState.paymentMethod || 'Select payment method'}
                      </span>
                      <ChevronDown size={18} className="text-gray-600 ml-2" />
                    </button>
                    {showPaymentMethodDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-48 overflow-y-auto">
                        <div
                          onClick={() => {
                            setFieldValue("paymentMethod", "Cash");
                            setShowPaymentMethodDropdown(false);
                          }}
                          className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                        >
                          Cash
                        </div>
                        <div
                          onClick={() => {
                            setFieldValue("paymentMethod", "Card");
                            setShowPaymentMethodDropdown(false);
                          }}
                          className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                        >
                          Card
                        </div>
                        <div
                          onClick={() => {
                            setFieldValue("paymentMethod", "Bank Transfer");
                            setShowPaymentMethodDropdown(false);
                          }}
                          className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                        >
                          Bank Transfer
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount*</label>
                  <input
                    type="number"
                    className="w-full text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6]"
                    placeholder="0.00"
                    min="0"
                    value={formState.totalAmount}
                    readOnly
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full text-black rounded-[4px] border border-gray-200 px-4 py-2 focus:outline-none bg-[#f3f4f6]"
                  placeholder="Special requests or notes"
                  value={formState.notes}
                  onChange={handleChange("notes")}
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between  sm:justify-center gap-4 px-3 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={creating || cabBookingLoading}
            className={`mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white`}
          >
            {creating || cabBookingLoading ? "Saving..." : "Add Guest"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestModal;
