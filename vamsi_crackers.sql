-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 19, 2026 at 12:09 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dhakshina_crackers`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(2, 'Flower Pots'),
(6, 'Garlands (மாலைகள்)'),
(3, 'Ground Chakkars (தரை சக்கரங்கள்)'),
(4, 'Rockets (ராக்கெட்டுகள்)'),
(5, 'Sky Shots (ஸ்கை ஷாட்ஸ்)'),
(1, 'Sparklers (ஸ்பார்க்லர்கள்)');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `phone`, `message`, `is_read`, `created_at`) VALUES
(2, 'Siva kumar', '9894736131', 'Test', 0, '2026-07-17 05:40:38');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `customer_city` varchar(255) NOT NULL,
  `customer_address` text NOT NULL,
  `total_amount` int(11) NOT NULL,
  `total_savings` int(11) NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `customer_email` varchar(255) DEFAULT '',
  `source` varchar(50) DEFAULT 'Website',
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_name`, `customer_phone`, `customer_city`, `customer_address`, `total_amount`, `total_savings`, `items`, `status`, `created_at`, `customer_email`, `source`, `is_read`) VALUES
(12, 'NATESH KUMAR SELVAMURUGAN', '9894116131', 'SIVAN KOVIL NANTHAVNAM, SIVAKASI', '901', 6040, 24160, '[{\"id\":15,\"name\":\"1000 Wala\",\"category\":\"Garlands (மாலைகள்)\",\"price\":240,\"originalPrice\":1200,\"quantity\":1},{\"id\":14,\"name\":\"240 Shot Mega Show (240 ஷாட் மெகா ஷோ)\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":4800,\"originalPrice\":24000,\"quantity\":1},{\"id\":13,\"name\":\"30 Shot Multi Color\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":1000,\"originalPrice\":5000,\"quantity\":1}]', 'Pending', '2026-07-09 07:27:44', 'NATESHKUMAR1406@GMAIL.COM', 'POS', 1),
(13, 'NATESH KUMAR SELVAMURUGAN', '9894116131', 'Sivakasi', '901SIVAN KOVIL NANTHAVNAM, SIVAKASI', 400, 1600, '[{\"id\":6,\"name\":\"Flower Pot Special\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":180,\"originalPrice\":900,\"quantity\":1},{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1}]', 'Pending', '2026-07-09 08:17:31', 'NATESHKUMAR1406@GMAIL.COM', 'Website', 1),
(14, 'NATESH KUMAR SELVAMURUGAN', '9894116131', 'Sivakasi', '901SIVAN KOVIL NANTHAVNAM, SIVAKASI', 320, 1280, '[{\"id\":6,\"name\":\"Flower Pot Special\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":180,\"originalPrice\":900,\"quantity\":1},{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1}]', 'Pending', '2026-07-09 08:27:17', 'NATESHKUMAR1406@GMAIL.COM', 'Website', 1),
(15, 'Natesh kumar', '9894116131', 'Sivakasi', 'Sivakasi', 6550, 1400, '[{\"id\":15,\"name\":\"1000 Wala\",\"category\":\"Garlands (மாலைகள்)\",\"price\":1200,\"originalPrice\":1200,\"quantity\":1},{\"id\":13,\"name\":\"30 Shot Multi Color (30 ஷாட் மல்டி கலர்)\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":5000,\"originalPrice\":5000,\"quantity\":1},{\"id\":3,\"name\":\"12cm Red Sparklers\",\"category\":\"Sparklers (ஸ்பார்க்லர்கள்)\",\"price\":70,\"originalPrice\":350,\"quantity\":1},{\"id\":2,\"name\":\"10cm Green Sparklers\",\"category\":\"Sparklers (ஸ்பார்க்லர்கள்)\",\"price\":60,\"originalPrice\":300,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1},{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1}]', 'Pending', '2026-07-10 12:09:58', 'nateshkumar1406@gmail.com', 'Website', 1),
(16, 'Natesh kumar', '9894116131', 'Sivakasi', 'Sivakasi', 580, 2320, '[{\"id\":11,\"name\":\"Lunik Rocket (லுனிக் ராக்கெட்)\",\"category\":\"Rockets (ராக்கெட்டுகள்)\",\"price\":180,\"originalPrice\":900,\"quantity\":1},{\"id\":10,\"name\":\"Baby Rocket\",\"category\":\"Rockets (ராக்கெட்டுகள்)\",\"price\":60,\"originalPrice\":300,\"quantity\":1},{\"id\":12,\"name\":\"12 Shot Skyout (12 ஷாட் ஸ்கைஅவுட்)\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":340,\"originalPrice\":1700,\"quantity\":1}]', 'Pending', '2026-07-10 12:26:23', 'nateshkumar1406@gmail.com', 'Website', 1),
(17, 'NATESH KUMAR SELVAMURUGAN', '09894116131', 'SIVAN KOVIL NANTHAVNAM, SIVAKASI', '901', 270, 1080, '[{\"id\":8,\"name\":\"Chakkar Deluxe\",\"category\":\"Ground Chakkars (தரை சக்கரங்கள்)\",\"price\":120,\"originalPrice\":600,\"quantity\":1},{\"id\":7,\"name\":\"Ground Chakkar Big (கிரவுண்ட் சக்கர் பெரியது)\",\"category\":\"Ground Chakkars (தரை சக்கரங்கள்)\",\"price\":90,\"originalPrice\":450,\"quantity\":1},{\"id\":10,\"name\":\"Baby Rocket\",\"category\":\"Rockets (ராக்கெட்டுகள்)\",\"price\":60,\"originalPrice\":300,\"quantity\":1}]', 'Pending', '2026-07-10 13:05:32', 'NATESHKUMAR1406@GMAIL.COM', 'Website', 1),
(18, 'NATESH KUMAR SELVAMURUGAN', '09894116131', 'SIVAN KOVIL NANTHAVNAM, SIVAKASI', '901', 5340, 1360, '[{\"id\":13,\"name\":\"30 Shot Multi Color (30 ஷாட் மல்டி கலர்)\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":5000,\"originalPrice\":5000,\"quantity\":1},{\"id\":12,\"name\":\"12 Shot Skyout (12 ஷாட் ஸ்கைஅவுட்)\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":340,\"originalPrice\":1700,\"quantity\":1}]', 'Pending', '2026-07-10 13:07:20', 'NATESHKUMAR1406@GMAIL.COM', 'Website', 1),
(19, 'NATESH KUMAR ', '9894116131', 'Sivakasi', '901 SIVAN KOVIL NANTHAVNAM, SIVAKASI', 220, 880, '[{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1}]', 'Pending', '2026-07-10 13:30:30', 'nateshkumarselvamurugan@gmail.com', 'Website', 1),
(20, 'NATESH KUMAR ', '9894116131', 'Sivakasi', '901 SIVAN KOVIL NANTHAVNAM, SIVAKASI', 220, 880, '[{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1}]', 'Pending', '2026-07-10 13:31:52', 'nateshkumarselvamurugan@gmail.com', 'Website', 1),
(22, 'Natesh kumar', '9894116131', 'Sivakasi', '901 SIVAN KOVIL NANTHAVNAM, SIVAKASI', 670, 2680, '[{\"id\":6,\"name\":\"Flower Pot Special\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":180,\"originalPrice\":900,\"quantity\":1},{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1},{\"id\":9,\"name\":\"Spinner Special (ஸ்பின்னர் ஸ்பெஷல்)\",\"category\":\"Ground Chakkars (தரை சக்கரங்கள்)\",\"price\":150,\"originalPrice\":750,\"quantity\":1},{\"id\":8,\"name\":\"Chakkar Deluxe\",\"category\":\"Ground Chakkars (தரை சக்கரங்கள்)\",\"price\":120,\"originalPrice\":600,\"quantity\":1}]', 'Pending', '2026-07-13 12:31:17', 'nateshkumarselvamurugan@gmail.com', 'Website', 1),
(2026202701, 'NATESH KUMAR SELVAMURUGAN', '09894116131', 'SIVAKASI', '901 SIVAN KOVIL NANTHAVNAM, SIVAKASI', 400, 1600, '[{\"id\":6,\"name\":\"Flower Pot Special\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":180,\"originalPrice\":900,\"quantity\":1},{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1}]', 'Pending', '2026-07-14 15:40:18', 'NATESHKUMAR1406@GMAIL.COM', 'Website', 1),
(2026202702, 'Natesh kumar', '9894116131', 'Sivakasi', '901, Sivan kOvil Nanthavanam Street', 220, 880, '[{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1}]', 'Shipped', '2026-07-15 07:54:43', 'nateshkumar1406@gmail.com', 'Website', 1),
(2026202703, 'Natesh kumar', '9894116131', 'Sivakasi', '901, Sivan kOvil Nanthavanam Street', 110, 440, '[{\"id\":2,\"name\":\"10cm Green Sparklers\",\"category\":\"Sparklers (ஸ்பார்க்லர்கள்)\",\"price\":60,\"originalPrice\":300,\"quantity\":1},{\"id\":1,\"name\":\"7cm Electric Sparklers\",\"category\":\"Sparklers (ஸ்பார்க்லர்கள்)\",\"price\":50,\"originalPrice\":250,\"quantity\":1}]', 'Shipped', '2026-07-15 07:58:52', 'nateshkumarselvamurugan@gmail.com', 'Website', 1),
(2026202704, 'Selvamurugan ', '9943916131', 'Sivakasi', '901, Sivan Kovil Nanthavana Street', 1540, 1360, '[{\"id\":15,\"name\":\"1000 Wala\",\"category\":\"Garlands (மாலைகள்)\",\"price\":1200,\"originalPrice\":1200,\"quantity\":1},{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1},{\"id\":8,\"name\":\"Chakkar Deluxe\",\"category\":\"Ground Chakkars (தரை சக்கரங்கள்)\",\"price\":120,\"originalPrice\":600,\"quantity\":1}]', 'Pending', '2026-07-17 06:18:56', 'nateshkumarselvamurugan@gmail.com', 'Website', 1),
(2026202705, 'Siva kumar', '9894736131', 'Sivakasi', '901, Sivan Kovil Street', 50, 200, '[{\"id\":1,\"name\":\"7cm Electric Sparklers\",\"category\":\"Sparklers (ஸ்பார்க்லர்கள்)\",\"price\":50,\"originalPrice\":250,\"quantity\":1}]', 'Pending', '2026-07-17 06:22:32', 'nateshkumarselvamurugan@gmail.com', 'Website', 1),
(2026202706, 'NATESH KUMAR SELVAMURUGAN', '09894116131', 'SIVAN KOVIL NANTHAVNAM, SIVAKASI', '901', 5040, 20160, '[{\"id\":15,\"name\":\"1000 Wala\",\"category\":\"Garlands (மாலைகள்)\",\"price\":1200,\"originalPrice\":1200,\"quantity\":1},{\"id\":14,\"name\":\"240 Shot Mega Show\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":24000,\"originalPrice\":24000,\"quantity\":1}]', 'Completed', '2026-07-17 07:06:30', 'NATESHKUMAR1406@GMAIL.COM', 'POS', 0),
(2026202707, 'NATESH KUMAR SELVAMURUGAN', '98941161431', 'SIVAN KOVIL NANTHAVNAM, SIVAKASI', '901', 220, 880, '[{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots (மலர் பானைகள்)\",\"price\":80,\"originalPrice\":400,\"quantity\":1}]', 'Completed', '2026-07-17 07:16:50', 'NATESHKUMAR1406@GMAIL.COM', 'POS', 0),
(2026202708, 'NATESH KUMAR SELVAMURUGAN', '9894116131', 'SIVAN KOVIL NANTHAVNAM, SIVAKASI', '901', 1760, 7040, '[{\"id\":15,\"name\":\"1000 Wala (1000 வாலா)\",\"category\":\"Garlands (மாலைகள்)\",\"price\":240,\"originalPrice\":1200,\"quantity\":1},{\"id\":11,\"name\":\"Lunik Rocket (லுனிக் ராக்கெட்)\",\"category\":\"Rockets (ராக்கெட்டுகள்)\",\"price\":180,\"originalPrice\":900,\"quantity\":1},{\"id\":13,\"name\":\"30 Shot Multi Color (30 ஷாட் மல்டி கலர்)\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":1000,\"originalPrice\":5000,\"quantity\":1},{\"id\":12,\"name\":\"12 Shot Skyout (12 ஷாட் ஸ்கைஅவுட்)\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":340,\"originalPrice\":1700,\"quantity\":1}]', 'Completed', '2026-07-19 06:15:21', 'nateshkumarselvamurugan@gmail.com', 'POS', 0),
(2026202709, 'Nandha', '9025526705', 'Sivakasi', 'Sithurajapuram ', 24460, 1840, '[{\"id\":14,\"name\":\"240 Shot Mega Show\",\"category\":\"Sky Shots (ஸ்கை ஷாட்ஸ்)\",\"price\":24000,\"originalPrice\":24000,\"quantity\":1},{\"id\":5,\"name\":\"Flower Pot Big\",\"category\":\"Flower Pots\",\"price\":140,\"originalPrice\":700,\"quantity\":1},{\"id\":4,\"name\":\"Flower Pot Small\",\"category\":\"Flower Pots\",\"price\":80,\"originalPrice\":400,\"quantity\":1},{\"id\":15,\"name\":\"1000 Wala (1000 வாலா)\",\"category\":\"Garlands (மாலைகள்)\",\"price\":240,\"originalPrice\":1200,\"quantity\":1}]', 'Processing', '2026-07-19 06:21:19', 'nanthaswetha7@gmail.com', 'Website', 1);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `originalPrice` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `discount` int(11) DEFAULT 0,
  `apply_discount` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `originalPrice`, `image`, `categoryId`, `discount`, `apply_discount`) VALUES
(1, '7cm Electric Sparklers', 50, 250, '/assets/images/products/sparklers.png', 1, 80, 1),
(2, '10cm Green Sparklers', 60, 300, '/assets/images/products/sparklers.png', 1, 80, 1),
(3, '12cm Red Sparklers', 70, 350, '/assets/images/products/sparklers.png', 1, 80, 1),
(4, 'Flower Pot Small', 80, 400, '/assets/images/products/flower_pots.png', 2, 80, 1),
(5, 'Flower Pot Big', 140, 700, '/assets/images/products/flower_pots.png', 2, 80, 1),
(6, 'Flower Pot Special', 180, 900, '/assets/images/products/flower_pots.png', 2, 80, 1),
(7, 'Ground Chakkar Big (கிரவுண்ட் சக்கர் பெரியது)', 90, 450, '/assets/images/products/ground_chakkars.png', 3, 80, 1),
(8, 'Chakkar Deluxe', 120, 600, '/assets/images/products/ground_chakkars.png', 3, 80, 1),
(9, 'Spinner Special (ஸ்பின்னர் ஸ்பெஷல்)', 150, 750, '/assets/images/products/ground_chakkars.png', 3, 80, 1),
(10, 'Baby Rocket', 60, 300, '/assets/images/products/rockets.png', 4, 80, 1),
(11, 'Lunik Rocket (லுனிக் ராக்கெட்)', 180, 900, '/assets/images/products/rockets.png', 4, 80, 1),
(12, '12 Shot Skyout (12 ஷாட் ஸ்கைஅவுட்)', 340, 1700, '/assets/images/products/sky_shots.png', 5, 80, 1),
(13, '30 Shot Multi Color (30 ஷாட் மல்டி கலர்)', 1000, 5000, '/assets/images/products/sky_shots.png', 5, 80, 1),
(14, '240 Shot Mega Show', 4800, 24000, '/assets/images/products/sky_shots.png', 5, 80, 1),
(15, '1000 Wala (1000 வாலா)', 240, 1200, '/assets/images/products/garlands.png', 6, 80, 1);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`key`, `value`) VALUES
('price_list_url', 'http://localhost:5000/uploads/price_list_1779259625571_Gomathi_Price_List-2025-1.pdf');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2026202710;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
