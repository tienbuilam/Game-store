-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 13, 2023 lúc 02:05 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `game_store`
--
drop schema if exists game_store;

create schema game_store;

use game_store;



DELIMITER $$
--
-- Thủ tục
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `addCode` (IN `id` VARCHAR(10), IN `inCode` VARCHAR(16))   BEGIN
		if inCode not in(select code from activation_code) then
			insert into activation_code values(id,inCode,'available');
		end if;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addCustomer` (IN `name` VARCHAR(100), IN `email` VARCHAR(50), IN `phone` VARCHAR(10), IN `dob` DATE, IN `username` VARCHAR(20), IN `userpassword` VARCHAR(20), OUT `usedEmail` VARCHAR(50), OUT `usedUsername` VARCHAR(20))   BEGIN
		declare numberOfCusomer int;
		set usedEmail:=null;
		set usedUsername:=null;
		if email in (select customer.email from customer) then
			set usedEmail:=email;		
		end if;
		if username in (select customer.username from customer) then
			set usedUsername:=username;		
		end if;
		if usedEmail is null and usedUsername is null then
			select cast(substring(customer.id,9) as unsigned) as value into numberOfCusomer from customer order by customer.id desc limit 1;
			if numberOfCusomer<10 then
				insert into customer values(concat("CUSTOMER0",numberOfCusomer+1),name,email,phone,0.0,'None',0,username,userpassword,null,dob);
			else
				insert into customer values(concat("CUSTOMER",numberOfCusomer+1),name,email,phone,0.0,'None',0,username,userpassword,null,dob);
			end if;
		end if;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addGame` (IN `Inname` VARCHAR(100), IN `Inprice` FLOAT, IN `Indiscount` FLOAT, IN `Indescription` TEXT, IN `Inspec_minimum` TEXT, IN `Inspec_recommended` TEXT, IN `Inpicture_1` TEXT, IN `Inpicture_2` TEXT, IN `Inpicture_3` TEXT, IN `Inpicture_4` TEXT, OUT `id` VARCHAR(10))   BEGIN
		declare counter int;
		select cast(substring(game.id,5) as unsigned) as value into counter from game order by game.id desc limit 1;
		if counter<10 then
			set id:=concat("GAME0",counter+1);
		else
			set id:=concat("GAME",counter+1);
		end if;
		if Inprice is not null then
			insert into game(id,name,price,discount,description,spec_minimum,spec_recommended,picture_1,picture_2,picture_3,picture_4) values(id,Inname,Inprice,Indiscount,Indescription,Inspec_minimum,Inspec_recommended,Inpicture_1,Inpicture_2,Inpicture_3,Inpicture_4);
		else
			insert into game(id,name,price,discount,description,spec_minimum,spec_recommended,picture_1,picture_2,picture_3,picture_4,status) values(id,Inname,null,Indiscount,Indescription,Inspec_minimum,Inspec_recommended,Inpicture_1,Inpicture_2,Inpicture_3,Inpicture_4,false);
		end if;
-- 		select @id;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addTag` (IN `id` VARCHAR(10), IN `tag` VARCHAR(50))   BEGIN
		if tag not in (select category_type from belongs_to where game_id=id) then
			insert into belongs_to values(id,tag);
		end if;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addToCart` (IN `gameID` VARCHAR(10), IN `customerID` VARCHAR(10), OUT `OutStatus` BOOL, OUT `OutRemain` BOOL, OUT `OutDeleted` BOOL)   BEGIN
		declare remains int;
        
        set OutStatus=null;
        set OutDeleted=null;
        set OutRemain=null;
        
		select exists (select * from game where game.id=gameID) into OutDeleted;
		set OutDeleted:= not OutDeleted;
		if not OutDeleted then
			set OutRemain:=true;
			select game.status into OutStatus from game where game.id=gameID;
			if OutStatus then
				select count(*) as count into remains from activation_code where game_id=gameID and status='Available';
				if remains != 0 then
					insert into shopping_cart values(gameID,customerID,'1');
				else
					set OutRemain:=false;
				end if;
			end if;
		end if;
-- 		select @OutDeleted, @OutStatus,@OutRemain;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addToWishlist` (IN `gameID` VARCHAR(10), IN `customerID` VARCHAR(10), OUT `OutStatus` BOOL, OUT `OutDeleted` BOOL)   BEGIN
		set OutStatus=null;
        set OutDeleted=null;
        
		select exists (select * from game where game.id=gameID) into OutDeleted;
		set OutDeleted:= not OutDeleted;
		if not OutDeleted then
			select game.status into OutStatus from game where game.id=gameID;
			if OutStatus then
				insert into wishlist values(gameID,customerID);
			end if;
		end if;
-- 		select @OutDeleted, @OutStatus;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `adjustAmount` (IN `gameID` VARCHAR(10), IN `customerID` VARCHAR(10), IN `mode` INT, IN `InAmount` INT, OUT `OutStatus` BOOL, OUT `OutDeleted` BOOL, OUT `OutNotEnough` BOOL)   BEGIN
		declare counter int;
		declare currentAmount int;
        
        set OutStatus=null;
        set OutDeleted=null;
        set OutNotEnough=null;
        
		select exists (select * from game where game.id=gameID) into OutDeleted;
		set OutDeleted = not OutDeleted;
		if NOT OutDeleted then
			select game.status into OutStatus from game where game.id=gameID;
			if OutStatus then
				if mode = 1 then
					update shopping_cart set amount = amount - 1 where game_id = gameID and customer_id = customerID and amount > 1;
				elseif mode = 2 then
					select count(*) into counter from activation_code where game_id = gameID and status = 'available';
					select amount into currentAmount from shopping_cart where game_id = gameID and customer_id = customerID;
					
					if currentAmount = counter then
						set OutNotEnough = true;
					else
						set OutNotEnough = false;
						update shopping_cart set amount = amount + 1 where game_id = gameID and customer_id = customerID;
					end if;
				else
					select count(*) into counter from activation_code where game_id = gameID and status = 'available';
					if InAmount > counter then
						set OutNotEnough = true;
					else
						set OutNotEnough = false;
						update shopping_cart set amount = InAmount where game_id = gameID and customer_id = customerID;
					end if;
				end if;
			end if;
		end if;
	--     select @OutDeleted, @OutStatus, @OutNotEnough;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `buyGame` (IN `customerID` VARCHAR(10), IN `total` DOUBLE, IN `InMethod` VARCHAR(15), OUT `OutStatus` BOOL, OUT `OutDeleted` BOOL, OUT `OutNotEnough` BOOL)   BEGIN
        declare idLoop varchar(10);
        declare currentAmont int;
        declare counter int;
        
        declare i int;
        declare spending double;
        declare CustomerRank varchar(8);
        declare selectedCode varchar(16);
        DECLARE generated_string VARCHAR(10);
        
        
        DECLARE done INT DEFAULT FALSE;
        declare reader cursor for select game_id from shopping_cart where customer_id=customerID;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
        
        set OutStatus=null;
        set OutDeleted=null;
        set OutNotEnough=null;
        
        open reader;
        
        read_loop_1: loop
			fetch reader into idLoop;
            IF done THEN
				LEAVE read_loop_1;
			END IF;
            set currentAmont=null;
            select exists (select * from game where game.id=idLoop) into OutDeleted;
			set OutDeleted = not OutDeleted;
            if OutDeleted then
				set done=true;
			else
				select game.status into OutStatus from game where game.id=idLoop;
                if OutStatus then
					select amount into currentAmont from shopping_cart where customer_id=customerID and game_id=idLoop;
                    select count(*) into counter from activation_code where game_id = idLoop and status = 'available';
                    if currentAmont>counter then
						set done=true;
                        set OutNotEnough=true;
					else
						set OutNotEnough=false;
                    end if;
                else
					set done=true;
                end if;
            end if;
        end loop;
        
        close reader;
        
        if OutStatus=true and OutDeleted=false and OutNotEnough=false then
			set done=false;
		
			open reader;
        
			read_loop_2: loop
				FETCH reader INTO idLoop;
				IF done THEN
					LEAVE read_loop_2;
				END IF;
                select amount into currentAmont from shopping_cart where customer_id=customerID and game_id=idLoop;
                set i=0;
                buy: loop
					if i=currentAmont then
						leave buy;
                    end if;
                    CALL generate_random_string(generated_string);
                    WHILE generated_string in (select description_id from purchase_history) DO
						CALL generate_random_string(generated_string);
					END WHILE;
                    select code into selectedCode from activation_code where game_id=idLoop and status='available' limit 1;
                    update activation_code set status='used' where code=selectedCode;
                    insert into purchase_history_description values(generated_string,InMethod,now());
                    insert into purchase_history values(customerID,idLoop,selectedCode,generated_string);
                    set i=i+1;
                end loop;
            end loop;
            
            close reader;
            
            update customer set total_spending=ROUND(total_spending+total,2) where id=customerID;
            select total_spending into spending from customer where id=customerID;
            select membership_rank into CustomerRank from customer where id=customerID;
            
            if CustomerRank!='Special' then
				if spending>=150 and spending<300 then
					update customer set membership_rank='Silver',membership_discount=1 where customer.id=customerID;
				elseif spending>=300 and spending<600 then
					update customer set membership_rank='Gold',membership_discount=2 where customer.id=customerID;
				else
					update customer set membership_rank='Diamond',membership_discount=3 where customer.id=customerID;
				end if;
            end if;
            
            delete from shopping_cart where customer_id=customerID;
            delete from wishlist where customer_id=customerID;
        end if;
        
	--     select @OutDeleted, @OutStatus, @OutNotEnough;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `generate_random_string` (OUT `random_string` VARCHAR(10))   BEGIN
		SET @chars := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		SET @len := 10;
		SET random_string := '';
		
		WHILE @len > 0 DO
			SET random_string := CONCAT(random_string, SUBSTRING(@chars, FLOOR(1 + RAND() * 36), 1));
			SET @len := @len - 1;
		END WHILE;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateAdminInfo` (IN `id` VARCHAR(10), IN `name` VARCHAR(100), IN `email` VARCHAR(20), IN `phone` VARCHAR(10), IN `address` VARCHAR(150), IN `userpassword` VARCHAR(20), IN `image` TEXT, IN `dob` DATE)   BEGIN
		update admin set admin.name=name where admin.id=id;
		update admin set admin.email=email where admin.id=id;
		update admin set admin.phone=phone where admin.id=id;
		update admin set admin.address=address where admin.id=id;
        update admin set admin.dob=dob where admin.id=id;
		if userpassword is not null then
			update admin set admin.userpassword=userpassword where admin.id=id;
		end if;
		if image is not null then
			update admin set admin.image=image where admin.id=id;
		end if;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateCustomerInfo` (IN `id` VARCHAR(10), IN `name` VARCHAR(100), IN `email` VARCHAR(20), IN `phone` VARCHAR(10), IN `userpassword` VARCHAR(20), IN `image` TEXT, IN `dob` DATE)   BEGIN
		update customer set customer.name=name where customer.id=id;
		update customer set customer.email=email where customer.id=id;
		update customer set customer.phone=phone where customer.id=id;
        update customer set customer.dob=dob where customer.id=id;
		if userpassword is not null then
			update customer set customer.userpassword=userpassword where customer.id=id;
		end if;
		if image is not null then
			update customer set customer.image=image where customer.id=id;
		end if;
	END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateGame` (IN `id` VARCHAR(10), IN `name` VARCHAR(100), IN `price` FLOAT, IN `discount` FLOAT, IN `description` TEXT, IN `spec_minimum` TEXT, IN `spec_recommended` TEXT, IN `picture_1` TEXT, IN `picture_2` TEXT, IN `picture_3` TEXT, IN `picture_4` TEXT)   BEGIN
		update game set game.name=name,game.price=price,game.discount=discount where game.id=id;
		if price is null then
			update game set game.status=false where game.id=id;
		end if;
		if description is not null then
			update game set game.description=description where game.id=id;
		end if;
		if spec_minimum is not null then
			update game set game.spec_minimum=spec_minimum where game.id=id;
		end if;
		if spec_recommended is not null then
			update game set game.spec_recommended=spec_recommended where game.id=id;
		end if;
		if picture_1 is not null then
			update game set game.picture_1=picture_1 where game.id=id;
		end if;
		if picture_2 is not null then
			update game set game.picture_2=picture_2 where game.id=id;
		end if;
		if picture_3 is not null then
			update game set game.picture_3=picture_3 where game.id=id;
		end if;
		if picture_4 is not null then
			update game set game.picture_4=picture_4 where game.id=id;
		end if;
	END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `activation_code`
--

CREATE TABLE `activation_code` (
  `game_id` varchar(10) NOT NULL,
  `code` varchar(16) NOT NULL,
  `status` varchar(13) DEFAULT 'available' CHECK (`status` = 'used' or `status` = 'available')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `activation_code`
--

INSERT INTO `activation_code` (`game_id`, `code`, `status`) VALUES
('GAME01', 'KYZXNH7B95FTG5RC', 'available'),
('GAME01', 'KYZXNH7B95FTG5RL', 'available'),
('GAME01', 'LV47LGEFPY2PXZ67', 'available'),
('GAME01', 'LV47LGEFPY2PXZ6F', 'available'),
('GAME01', 'SQT8CXG8VWKBP9Q1', 'available'),
('GAME01', 'SQT8CXG8VWKBP9QB', 'available'),
('GAME02', 'MTPAJHMJMBPVHR9W', 'available'),
('GAME02', 'MTPAJHMJMBPVHR9X', 'available'),
('GAME02', 'N56GEPPGFHB7VVKA', 'available'),
('GAME02', 'N56GEPPGFHB7VVKE', 'available'),
('GAME02', 'ZR2ZXN4QXDTWJQ79', 'available'),
('GAME02', 'ZR2ZXN4QXDTWJQ7U', 'available'),
('GAME03', 'DP44F8XHCGEBQSNB', 'available'),
('GAME03', 'DP44F8XHCGEBQSNI', 'available'),
('GAME03', 'WVTKJKK8VL3ALFXF', 'available'),
('GAME03', 'WVTKJKK8VL3ALFXO', 'available'),
('GAME03', 'ZUGJX32CGJTLXVXH', 'available'),
('GAME03', 'ZUGJX32CGJTLXVXX', 'available'),
('GAME04', 'AEOSR8SLXC2EOKG4', 'available'),
('GAME04', 'CQKP1QOI2E98DHHC', 'available'),
('GAME04', 'HVYD219XROCELSH3', 'available'),
('GAME04', 'IP6RA1PWE95YU4GH', 'available'),
('GAME05', '7Y8BRVQD5FYJACOI', 'available'),
('GAME05', 'K6XSEDL9HATQSQ2S', 'available'),
('GAME05', 'N04NAGGQT2NIZPC9', 'available'),
('GAME05', 'SKFZA1NRWA0TKJ24', 'available'),
('GAME06', 'DAA4XQ8FY4OXF32X', 'available'),
('GAME06', 'EO8BND6M67HDD7ST', 'available'),
('GAME07', '2Y6ZV5CRYLGDRMRO', 'available'),
('GAME07', '3KNE1VD7XWDDK46N', 'available'),
('GAME07', 'VG5KTJFGXGHIFRAK', 'available'),
('GAME08', '46QN0IRXT8NMS7U8', 'available'),
('GAME08', 'N6LVQVYTSBNTBI8K', 'available'),
('GAME08', 'STEU31JSYXBKA8O3', 'available'),
('GAME08', 'VCH6HPTJGCMQ77Q5', 'available'),
('GAME09', 'LFDPNFUJ08J0ZFHJ', 'available'),
('GAME09', 'ORBZW5U6REET76TM', 'available'),
('GAME09', 'UEVY8Y944GITQNLK', 'available'),
('GAME10', 'LRBCO6ANBOEOKCOF', 'available'),
('GAME10', 'ZT1VZSV776G09ZY5', 'available'),
('GAME11', 'S1FJ8NFW4EYVE33D', 'available'),
('GAME11', 'Z2KI5Y03B491UB1F', 'available'),
('GAME12', 'EEWHOUYQAKJ25QQR', 'available'),
('GAME12', 'XJMPMDRHI2A3OD04', 'available'),
('GAME13', '1UE640ECX4EE6X52', 'available'),
('GAME13', '2661A0VRJMBJABHS', 'available'),
('GAME14', 'BQJTPNUO4SX6GLZD', 'available'),
('GAME14', '8GK70CWHF5E3JXY2', 'available'),
('GAME14', 'RDVXW9JONZAHKQPC', 'available'),
('GAME15', '51KOL4VHAWJCEZPQ', 'available'),
('GAME15', 'QHF2R7U8E3J5D6GB', 'available'),
('GAME16', 'VST3Z6YW1RFNCB97', 'available'),
('GAME17', 'HPOJW6XKQND9RG34', 'available'),
('GAME17', 'LQVJ3M70GCS6X4KO', 'available');


-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin`
--

CREATE TABLE `admin` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(20) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `address` varchar(150) DEFAULT NULL,
  `username` varchar(20) NOT NULL,
  `userpassword` varchar(20) NOT NULL,
  `image` text DEFAULT NULL,
  `dob` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `phone`, `address`, `username`, `userpassword`, `image`, `dob`) VALUES
('ADMIN01', 'Lê Thái Tân', 'admin@gmail.com', '0123456789', NULL, 'admin01', 'admin123', NULL, '1999-01-01'),
('ADMIN02', 'Cao Nguyễn Hòa Sơn', 'admin1@gmail.com', '0123456789', NULL, 'admin011', 'admin1231', NULL, '2002-01-01'),
('ADMIN03', 'Bùi Lâm Tiến', 'admin2@gmail.com', '0123456789', NULL, 'admin0111', 'admin12311', NULL, '1999-01-01'),
('ADMIN04', 'Trần Quang Hưng', 'admin4@gmail.com', '0123456789', NULL, 'admin01113', 'admin123113', NULL, '1999-01-01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `belongs_to`
--

CREATE TABLE `belongs_to` (
  `game_id` varchar(10) NOT NULL,
  `category_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `belongs_to`
--

INSERT INTO `belongs_to` (`game_id`, `category_type`) VALUES
('GAME01', 'Action RPG'),
('GAME02', 'Story-Rich'),
('GAME02', 'Third-Person Shooter'),
('GAME03', 'Action RPG'),
('GAME03', 'Hack & Slash'),
('GAME03', 'Story-Rich'),
('GAME04', 'Adventure RPG'),
('GAME04', 'Story-Rich'),
('GAME04', 'Third-Person Shooter'),
('GAME05', 'Adventure RPG'),
('GAME05', 'Story-Rich'),
('GAME05', 'Third-Person Shooter'),
('GAME06', 'Strategy RPG'),
('GAME06', 'Turn-Based'),
('GAME07', 'First-Person Shooter'),
('GAME08', 'Adventure RPG'),
('GAME08', 'Story-Rich'),
('GAME09', 'First-Person Shooter'),
('GAME10', 'Action RPG'),
('GAME10', 'Hack & Slash'),
('GAME10', 'Story-Rich'),
('GAME11', 'Story-Rich'),
('GAME11', 'Visual Novel'),
('GAME12', 'Story-Rich'),
('GAME12', 'Visual Novel'),
('GAME13', 'Action RPG'),
('GAME14', 'First-Person Shooter'),
('GAME14', 'Story-Rich'),
('GAME15', 'Turn-Based'),
('GAME15', 'First-Person Shooter'),
('GAME16', 'Adventure RPG'),
('GAME16', 'First-Person Shooter'),
('GAME17', 'Visual Novel'),
('GAME17', 'Strategy RPG');
-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category`
--

CREATE TABLE `category` (
  `type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `category`
--

INSERT INTO `category` (`type`) VALUES
('Action RPG'),
('Adventure RPG'),
('Arcade & Rhythm'),
('Building & Automation'),
('Car & Board'),
('Casual'),
('City & Settlement'),
('Dating'),
('Farming & Crafting'),
('Fighting & Martial Arts'),
('First-Person Shooter'),
('Fishing & Hunting'),
('Grand & 4X'),
('Hack & Slash'),
('Hidden Object'),
('Hobby & Job'),
('Individual Sports'),
('JRPG'),
('Life & Immersive'),
('Metroidvania'),
('Military'),
('Party-Based'),
('Platformer & Runner'),
('Puzzle'),
('Racing'),
('Racing Sim'),
('Real-Time Strategy'),
('Rogue-Like'),
('Sandbox & Physics'),
('Space & Flight'),
('Sports Sim'),
('Story-Rich'),
('Strategy RPG'),
('Team Sports'),
('Third-Person Shooter'),
('Tower Defense'),
('Turn-Based'),
('Turn-Based Strategy'),
('Visual Novel');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customer`
--

CREATE TABLE `customer` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `total_spending` double DEFAULT 0,
  `membership_rank` varchar(8) DEFAULT 'None' CHECK (`membership_rank` = 'None' or `membership_rank` = 'Silver' or `membership_rank` = 'Gold' or `membership_rank` = 'Diamond' or `membership_rank` = 'Special'),
  `membership_discount` float DEFAULT 0 CHECK (0 <= `membership_discount` and `membership_discount` <= 5),
  `username` varchar(20) NOT NULL,
  `userpassword` varchar(20) NOT NULL,
  `image` text DEFAULT NULL,
  `dob` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `customer`
--

INSERT INTO `customer` (`id`, `name`, `email`, `phone`, `total_spending`, `membership_rank`, `membership_discount`, `username`, `userpassword`, `image`, `dob`) VALUES
('CUSTOMER01', 'Lê Văn B', 'b_le@gmail.com', NULL, 0, 'None', 0, 'customer01', 'customer123', NULL, NULL),
('CUSTOMER02', 'Lê Thái A', 't_nguyen@gmail.com', NULL, 0, 'None', 0, 'customer02', 'customer123', NULL, NULL),
('CUSTOMER03', 'Bùi Lâm T', 'n_trung@gmail.com', NULL, 0, 'None', 0, 'customer03', 'customer123', NULL, NULL),
('CUSTOMER04', 'Cao Nguyễn Hòa A', 'h_nguyen@gmail.com', NULL, 0, 'None', 0, 'customer04', 'customer123', NULL, NULL),
('CUSTOMER05', 'Dương Minh T', 't_duong@gmail.com', NULL, 0, 'None', 0, 'customer05', 'customer123', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `game`
--

CREATE TABLE `game` (
  `id` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` float DEFAULT NULL,
  `discount` float DEFAULT NULL,
  `description` text DEFAULT NULL,
  `spec_minimum` text DEFAULT NULL,
  `spec_recommended` text DEFAULT NULL,
  `picture_1` text DEFAULT NULL,
  `picture_2` text DEFAULT NULL,
  `picture_3` text DEFAULT NULL,
  `picture_4` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `game`
--

INSERT INTO `game` (`id`, `name`, `price`, `discount`, `description`, `spec_minimum`, `spec_recommended`, `picture_1`, `picture_2`, `picture_3`, `picture_4`, `status`) VALUES
('GAME01', 'Elden Ring', 59.99, 0, 'THE NEW FANTASY ACTION RPG.\r\nRise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.\r\n• A Vast World Full of Excitement\r\nA vast world where open fields with a variety of situations and huge dungeons with complex and three-dimensional designs are seamlessly connected. As you explore, the joy of discovering unknown and overwhelming threats await you, leading to a high sense of accomplishment.\r\n• Create your Own Character\r\nIn addition to customizing the appearance of your character, you can freely combine the weapons, armor, and magic that you equip. You can develop your character according to your play style, such as increasing your muscle strength to become a strong warrior, or mastering magic.\r\n• An Epic Drama Born from a Myth\r\nA multilayered story told in fragments. An epic drama in which the various thoughts of the characters intersect in the Lands Between.\r\n• Unique Online Play that Loosely Connects You to Others\r\nIn addition to multiplayer, where you can directly connect with other players and travel together, the game supports a unique asynchronous online element that allows you to feel the presence of others.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10\r\nProcessor: INTEL CORE I5-8400 or AMD RYZEN 3 3300X\r\nMemory: 12 GB RAM\r\nGraphics: NVIDIA GEFORCE GTX 1060 3 GB or AMD RADEON RX 580 4 GB\r\nDirectX: Version 12\r\nStorage: 60 GB available space\r\nSound Card: Windows Compatible Audio Device', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10/11\r\nProcessor: INTEL CORE I7-8700K or AMD RYZEN 5 3600X\r\nMemory: 16 GB RAM\r\nGraphics: NVIDIA GEFORCE GTX 1070 8 GB or AMD RADEON RX VEGA 56 8 GB\r\nDirectX: Version 12\r\nStorage: 60 GB available space\r\nSound Card: Windows Compatible Audio Device', 'Elden ring/Elden ring-1.jpg', 'Elden ring/Elden ring-2.jpg', 'Elden ring/Elden ring-3.jpg', 'Elden ring/Elden ring-4.jpg', 1),
('GAME02', 'Resident Evil 4', 59.99, 0, 'Survival is just the beginning.\r\n\r\nSix years have passed since the biological disaster in Raccoon City.\r\nAgent Leon S. Kennedy, one of the survivors of the incident, has been sent to rescue the president\'s kidnapped daughter.\r\nHe tracks her to a secluded European village, where there is something terribly wrong with the locals.\r\nAnd the curtain rises on this story of daring rescue and grueling horror where life and death, terror and catharsis intersect.\r\n\r\nFeaturing modernized gameplay, a reimagined storyline, and vividly detailed graphics,\r\nResident Evil 4 marks the rebirth of an industry juggernaut.\r\n\r\nRelive the nightmare that revolutionized survival horror.Survival is just the beginning.\r\n\r\nSix years have passed since the biological disaster in Raccoon City.\r\nAgent Leon S. Kennedy, one of the survivors of the incident, has been sent to rescue the president\'s kidnapped daughter.\r\nHe tracks her to a secluded European village, where there is something terribly wrong with the locals.\r\nAnd the curtain rises on this story of daring rescue and grueling horror where life and death, terror and catharsis intersect.\r\n\r\nFeaturing modernized gameplay, a reimagined storyline, and vividly detailed graphics,\r\nResident Evil 4 marks the rebirth of an industry juggernaut.\r\n\r\nRelive the nightmare that revolutionized survival horror.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 (64 bit)\r\nProcessor: AMD Ryzen 3 1200 / Intel Core i5-7500\r\nMemory: 8 GB RAM\r\nGraphics: AMD Radeon RX 560 with 4GB VRAM / NVIDIA GeForce GTX 1050 Ti with 4GB VRAM\r\nDirectX: Version 12\r\nNetwork: Broadband Internet connection\r\nAdditional Notes: Estimated performance (when set to Prioritize Performance): 1080p/45fps. ・Framerate might drop in graphics-intensive scenes. ・AMD Radeon RX 6700 XT or NVIDIA GeForce RTX 2060 required to support ray tracing.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 (64 bit)/Windows 11 (64 bit)\r\nProcessor: AMD Ryzen 5 3600 / Intel Core i7 8700\r\nMemory: 16 GB RAM\r\nGraphics: AMD Radeon RX 5700 / NVIDIA GeForce GTX 1070\r\nDirectX: Version 12\r\nNetwork: Broadband Internet connection\r\nAdditional Notes: Estimated performance: 1080p/60fps ・Framerate might drop in graphics-intensive scenes. ・AMD Radeon RX 6700 XT or NVIDIA GeForce RTX 2070 required to support ray tracing.', 'Resident Evil 4/Resident_evil_4_pic1.jpg', 'Resident Evil 4/Resident_evil_4_pic2.jpeg', 'Resident Evil 4/Resident_evil_4_pic3.jpg', 'Resident Evil 4/Resident_evil_4_pic4.jpg', 1),
('GAME03', 'God of War', 49.99, 40, 'Enter the Norse realm\r\nHis vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters. It is in this harsh, unforgiving world that he must fight to survive… and teach his son to do the same.\r\n\r\nGrasp a second chance\r\nKratos is a father again. As mentor and protector to Atreus, a son determined to earn his respect, he is forced to deal with and control the rage that has long defined him while out in a very dangerous world with his son.\r\n\r\nJourney to a dark, elemental world of fearsome creatures\r\nFrom the marble and columns of ornate Olympus to the gritty forests, mountains and caves of pre-Viking Norse lore, this is a distinctly new realm with its own pantheon of creatures, monsters and gods.\r\n\r\nEngage in visceral, physical combat\r\nWith an over the shoulder camera that brings the player closer to the action than ever before, fights in God of War™ mirror the pantheon of Norse creatures Kratos will face: grand, gritty and grueling. A new main weapon and new abilities retain the defining spirit of the God of War series while presenting a vision of conflict that forges new ground in the genre.\r\nPC FEATURES\r\nHigh Fidelity Graphics\r\nStriking visuals enhanced on PC. Enjoy true 4K resolution, on supported devices, [MU1] with unlocked framerates for peak performance. Dial in your settings via a wide range of graphical presets and options including higher resolution shadows, improved screen space reflections, the addition of GTAO and SSDO, and much more.\r\n\r\nNVIDIA® DLSS and Reflex Support\r\nQuality meets performance. Harness the AI power of NVIDIA Deep Learning Super Sampling (DLSS) to boost frame rates and generate beautiful, sharp images on select Nvidia GPUs. Utilize NVIDIA Reflex low latency technology allowing you to react quicker and hit harder combos with the responsive gameplay you crave on GeForce GPUs.\r\n\r\nControls Customization\r\nPlay your way. With support for the DUALSHOCK®4 and DUALSENSE® wireless controllers, a wide range of other gamepads, and fully customizable bindings for mouse and keyboard, you have the power to fine-tune every action to match your playstyle.\r\n\r\nUltra-wide Support\r\nImmerse yourself like never before. Journey through the Norse realms taking in breathtaking vistas in panoramic widescreen. With 21:9 ultra-widescreen support, God of War™ presents a cinema quality experience that further expands the original seamless theatrical vision.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 64-bit\r\nProcessor: Intel i5-2500k (4 core 3.3 GHz) or AMD Ryzen 3 1200 (4 core 3.1 GHz)\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA GTX 960 (4 GB) or AMD R9 290X (4 GB)\r\nDirectX: Version 11\r\nStorage: 70 GB available space\r\nAdditional Notes: DirectX feature level 11_1 required', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 64-bit\r\nProcessor: Intel i5-6600k (4 core 3.5 GHz) or AMD Ryzen 5 2400 G (4 core 3.6 GHz)\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA GTX 1060 (6 GB) or AMD RX 570 (4 GB)\r\nDirectX: Version 11\r\nStorage: 70 GB available space\r\nAdditional Notes: DirectX feature level 11_1 required', 'God of war/gow_1.jpg', 'God of war/gow_2.jpg', 'God of war/gow_3.jpg', 'God of war/gow_4.jpg', 1),
('GAME04', 'Red Dead Redemption 2', 42.62, 10, 'America, 1899.\r\n\r\nArthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America in order to survive. As deepening internal divisions threaten to tear the gang apart, Arthur must make a choice between his own ideals and loyalty to the gang who raised him.\r\n\r\nNow featuring additional Story Mode content and a fully-featured Photo Mode, Red Dead Redemption 2 also includes free access to the shared living world of Red Dead Online, where players take on an array of roles to carve their own unique path on the frontier as they track wanted criminals as a Bounty Hunter, create a business as a Trader, unearth exotic treasures as a Collector or run an underground distillery as a Moonshiner and much more.\r\n\r\nWith all new graphical and technical enhancements for deeper immersion, Red Dead Redemption 2 for PC takes full advantage of the power of the PC to bring every corner of this massive, rich and detailed world to life including increased draw distances; higher quality global illumination and ambient occlusion for improved day and night lighting; improved reflections and deeper, higher resolution shadows at all distances; tessellated tree textures and improved grass and fur textures for added realism in every plant and animal.\r\n\r\nRed Dead Redemption 2 for PC also offers HDR support, the ability to run high-end display setups with 4K resolution and beyond, multi-monitor configurations, widescreen configurations, faster frame rates and more.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 - April 2018 Update (v1803)\r\nProcessor: Intel® Core™ i7-4770K / AMD Ryzen 5 1500X\r\nMemory: 12 GB RAM\r\nGraphics: Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB\r\nNetwork: Broadband Internet connection\r\nStorage: 150 GB available space\r\nSound Card: Direct X Compatible', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 - April 2018 Update (v1803)\r\nProcessor: Intel® Core™ i7-4770K / AMD Ryzen 5 1500X\r\nMemory: 12 GB RAM\r\nGraphics: Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB\r\nNetwork: Broadband Internet connection\r\nStorage: 150 GB available space\r\nSound Card: Direct X Compatible', 'Red Dead Redemption 2/RDR-pic1.jpg', 'Red Dead Redemption 2/RDR-pic2.jpg', 'Red Dead Redemption 2/RDR-pic3.jpg', 'Red Dead Redemption 2/RDR-pic4.jpg', 1),
('GAME05', 'The Last of Us™ Part I', 59.99, 0, 'Experience the emotional storytelling and unforgettable characters in The Last of Us™, winner of over 200 Game of the Year awards.\r\n\r\nIn a ravaged civilization, where infected and hardened survivors run rampant, Joel, a weary protagonist, is hired to smuggle 14-year-old Ellie out of a military quarantine zone. However, what starts as a small job soon transforms into a brutal cross-country journey.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 (Version 1909 or Newer)\r\nProcessor: AMD Ryzen 5 1500X, Intel Core i7-4770K\r\nMemory: 16 GB RAM\r\nGraphics: AMD Radeon RX 470 (4 GB), AMD Radeon RX 6500 XT (4 GB), NVIDIA GeForce GTX 970 (4 GB), NVIDIA GeForce GTX 1050 Ti (4 GB)\r\nStorage: 100 GB available space\r\nAdditional Notes: SSD Recommended', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 (Version 1909 or Newer)\r\nProcessor: AMD Ryzen 5 3600X, Intel Core i7-8700\r\nMemory: 16 GB RAM\r\nGraphics: AMD Radeon RX 5700 XT (8 GB), AMD Radeon RX 6600 XT (8 GB), NVIDIA GeForce RTX 2070 SUPER (8 GB), NVIDIA GeForce RTX 3060 (8 GB)\r\nStorage: 100 GB available space\r\nAdditional Notes: SSD Recommended', 'The Last Of Us 1/tlou-1.jpg', 'The Last Of Us 1/tlou-2.jpg', 'The Last Of Us 1/tlou-3.jpg', 'The Last Of Us 1/tlou-4.jpg', 1),
('GAME06', 'The Great War: Western Front™', 19.99, 30, 'The Great War: Western Front is the definitive World War 1 strategy game from Petroglyph, the makers of Command & Conquer™ Remastered & Star Wars™: Empire at War. Play a deciding role in history with this real-time tactical experience as you take charge in the pivotal Western Front from 1914 to 1919.\r\n\r\nPick your faction and lead your forces to victory, by directing your armies in gritty real-time battles and by guiding high-level decisions in turn-based strategic gameplay. Dig detailed trenches, research new technologies such as poison gas and tanks, and make decisions that will have a profound and lasting effect on your success. Think like a Commander to either relive history - or redefine it.\r\n\r\nDiscover unparalleled levels of strategic choice as you step into the role of both Theatre Commander and Field Commander.\r\n\r\nAs Theatre Commander, experience enthralling turn-based grand-strategy as you direct the deployment of forces, perform research and carefully consider how you disseminate your resources across the Western Front in a war won by inches. Alongside this, take up the mantle of Field Commander in dynamic real-time battles as you direct units to defeat your opponent, build trenches and perform direct assaults by sending your infantry over the top. Pick your battles and fight them your way to shape the course of history.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 64bit\r\nProcessor: Intel i5-4590 / AMD FX-8350\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA GeForce GTX 780 / AMD Radeon R9 390\r\nDirectX: Version 11\r\nStorage: 13 GB available space\r\nAdditional Notes: SSD Recommended', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10/11 64bit\r\nProcessor: Intel i5-8600K / AMD Ryzen 5 2600\r\nMemory: 16 GB RAM\r\nGraphics: NVIDIA GeForce GTX 1060 / AMD Radeon RX 580\r\nDirectX: Version 11\r\nStorage: 13 GB available space\r\nAdditional Notes: SSD Recommended', 'The Great War Western Front/greatwar-1.jpg', 'The Great War Western Front/greatwar-2.jpg', 'The Great War Western Front/greatwar-3.jpg', 'The Great War Western Front/greatwar-4.jpg', 1),
('GAME07', 'Fallout 76', 31.99, 10, 'Bethesda Game Studios, the award-winning creators of Skyrim and Fallout 4, welcome you to Fallout 76. Twenty-five years after the bombs fell, you and your fellow Vault Dwellers—chosen from the nation’s best and brightest – emerge into post-nuclear America on Reclamation Day, 2102. Play solo or join together as you explore, quest, build, and triumph against the wasteland’s greatest threats. Explore a vast wasteland, devastated by nuclear war, in this open-world multiplayer addition to the Fallout story. Experience the largest, most dynamic world ever created in the legendary Fallout universe.\r\n\r\nThe Mutation Invasion is here and mutations from Daily Ops\' missions have infected Public Events! Play a Mutated Public Event every hour for additional rewards and challenges, and jump back into Daily Ops to earn scaling rewards and experience a new variety of locations, enemies, and mutations.\r\nImmersive Questlines and Engaging Characters\r\nUncover the secrets of West Virginia by playing through an immersive main quest, starting from the moment you leave Vault 76. Befriend or betray new neighbors who have come to rebuild, and experience Appalachia through the eyes of its residents.\r\nSeasonal Scoreboard\r\nProgress through a season with a completely free set of rewards like consumables, C.A.M.P. items and more, by completing limited-time challenges.\r\nMultiplayer Roleplaying\r\nCreate your character with the S.P.E.C.I.A.L system and forge your own path and reputation in a new and untamed wasteland with hundreds of locations. Whether you journey alone or with friends, a new and unique Fallout adventure awaits.\r\nMountain splendorland\r\nThe story lives and breathes through the world of Fallout 76, which brings to life six distinct West Virginia regions. From the forests of Appalachia to the noxious crimson expanses of the Cranberry Bog, each area offers its own risks and rewards.\r\nA New American Dream\r\nUse the all-new Construction and Assembly Mobile Platform (C.A.M.P.) to build and craft anywhere in the world. Your C.A.M.P. will provide much-needed shelter, supplies, and safety. You can even set up shop to trade goods with other survivors.\r\nFallout Worlds\r\nPlay unique adventures in Appalachia with Fallout Worlds, which is an evolving set of features that give players the capability to play Fallout 76 in unique ways with customizable settings.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 8.1/10 (64-bit versions)\r\nProcessor: Intel Core i5-6600k 3.5 GHz /AMD Ryzen 3 1300X 3.5 GHz or equivalent\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA GTX 780 3GB /AMD Radeon R9 285 2GB or equivalent\r\nNetwork: Broadband Internet connection\r\nStorage: 80 GB available space', 'Requires a 64-bit processor and operating system\r\nOS: Windows 8.1/10 (64-bit versions)\r\nProcessor: Intel Core i7-4790 3.6 GHz /AMD Ryzen 5 1500X 3.5 GHz\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA GTX 970 4GB /AMD R9 290X 4GB\r\nNetwork: Broadband Internet connection\r\nStorage: 80 GB available space', 'Fallout 76/Fallout 76-1.jpg', 'Fallout 76/Fallout 76-2.jpg', 'Fallout 76/Fallout 76-3.jpg', 'Fallout 76/Fallout 76-4.jpg', 1),
('GAME08', 'Hogwarts Legacy', 49.99, 10, 'Hogwarts Legacy is an open-world action RPG set in the world first introduced in the Harry Potter books. Embark on a journey through familiar and new locations as you explore and discover magical beasts, customize your character and craft potions, master spell casting, upgrade talents and become the wizard you want to be.\r\n\r\n\r\n\r\nExperience Hogwarts in the 1800s. Your character is a student who holds the key to an ancient secret that threatens to tear the wizarding world apart. Make allies, battle Dark wizards, and ultimately decide the fate of the wizarding world. Your legacy is what you make of it. Live the Unwritten.', 'Requires a 64-bit processor and operating system\r\nOS: 64-bit Windows 10\r\nProcessor: Intel Core i5-6600 (3.3Ghz) or AMD Ryzen 5 1400 (3.2Ghz)\r\nMemory: 16 GB RAM\r\nGraphics: NVIDIA GeForce GTX 960 4GB or AMD Radeon RX 470 4GB\r\nDirectX: Version 12\r\nStorage: 85 GB available space\r\nAdditional Notes: SSD (Preferred), HDD (Supported), 720p/30 fps, Low Quality Settings', 'Requires a 64-bit processor and operating system\r\nOS: 64-bit Windows 10\r\nProcessor: Intel Core i7-8700 (3.2Ghz) or AMD Ryzen 5 3600 (3.6 Ghz)\r\nMemory: 16 GB RAM\r\nGraphics: NVIDIA GeForce 1080 Ti or AMD Radeon RX 5700 XT or INTEL Arc A770\r\nDirectX: Version 12\r\nStorage: 85 GB available space\r\nAdditional Notes: SSD, 1080p/60 fps, High Quality Settings', 'Hogwart Legacy/hl-1.jpg', 'Hogwart Legacy/hl-2.jpg', 'Hogwart Legacy/hl-3.jpg', 'Hogwart Legacy/hl-4.jpg', 1),
('GAME09', 'Destiny 2', 9.99, 0, 'Dive into the world of Destiny 2 to explore the mysteries of the solar system and experience responsive first-person shooter combat. Unlock powerful elemental abilities and collect unique gear to customize your Guardian\'s look and playstyle. Enjoy Destiny 2’s cinematic story, challenging co-op missions, and a variety of PvP modes alone or with friends. Download for free today and write your legend in the stars.\r\nAn Immersive Story\r\nYou are a Guardian, defender of the Last City of humanity in a solar system under siege by infamous villains. Look to the stars and stand against the darkness. Your legend begins now.\r\nGuardian Classes\r\nChoose from the armored Titan, mystic Warlock, or swift Hunter.\r\n\r\nTitan\r\nDisciplined and proud, Titans are capable of both aggressive assaults and stalwart defenses. Set your hammer ablaze, crack the sky with lightning, and go toe-to-toe with any opponent. Your team will stand tall behind the strength of your shield.\r\n\r\nWarlock\r\nWarlocks weaponize the mysteries of the universe to sustain themselves and destroy their foes. Rain devastation on the battlefield and clear hordes of enemies in the blink of an eye. Those who stand with you will know the true power of the Light.\r\n\r\nHunter\r\nAgile and daring, Hunters are quick on their feet and quicker on the draw. Fan the hammer of your golden gun, flow through enemies like the wind, or strike from the darkness. Find the enemy, take aim, and end the fight before it starts.\r\nCooperative and Competitive Multiplayer\r\nPlay with or against your friends and other Guardians in various PvE and PvP game modes.\r\n\r\nCooperative Multiplayer\r\nExciting co-op adventures teeming await with rare and powerful rewards. Dive into the story with missions, quests, and patrols. Put together a small fireteam and secure the chest at the end of a quick Strike. Or test your team\'s skill with countless hours of raid progression – the ultimate challenge for any fireteam. You decide where your legend begins.\r\n\r\nCompetitive Multiplayer\r\nFace off against other players in fast-paced free-for-all skirmishes, team arenas, and PvE/PvP hybrid competitions. Mark special competitions like Iron Banner on your calendar and collect limited-time rewards before they\'re gone.\r\nExotic Weapons and Armor\r\nThousands of weapons, millions of options. Discover new gear combinations and define your own personal style. The hunt for the perfect arsenal begins.', 'Requires a 64-bit processor and operating system\r\nOS: Windows® 7 / Windows® 8.1 / Windows® 10 64-bit (latest Service Pack)\r\nProcessor: Intel® Core™ i3 3250 3.5 GHz or Intel Pentium G4560 3.5 GHz / AMD FX-4350 4.2 GHz\r\nMemory: 6 GB RAM\r\nGraphics: NVIDIA® GeForce® GTX 660 2GB or GTX 1050 2GB / AMD Radeon HD 7850 2GB\r\nNetwork: Broadband Internet connection\r\nStorage: 105 GB available space', 'Requires a 64-bit processor and operating system\r\nOS: System Windows® 7 / Windows® 8.1 / Windows® 10 64-bit (latest Service Pack)\r\nProcessor: Processor Intel® Core™ i5 2400 3.4 GHz or i5 7400 3.5 GHz / AMD Ryzen R5 1600X 3.6 GHz\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA® GeForce® GTX 970 4GB or GTX 1060 6GB / AMD R9 390 8GB Memory 8 GB RAM\r\nNetwork: Broadband Internet connection\r\nStorage: 105 GB available space', 'Destiny 2/Destiny 2-1.jpg', 'Destiny 2/Destiny 2-2.jpg', 'Destiny 2/Destiny 2-3.jpg', 'Destiny 2/Destiny 2-4.jpg', 1),
('GAME10', 'MONSTER HUNTER RISE', 39.99, 20, 'Rise to the challenge and join the hunt! In Monster Hunter Rise, the latest installment in the award-winning and top-selling Monster Hunter series, you’ll become a hunter, explore brand new maps and use a variety of weapons to take down fearsome monsters as part of an all-new storyline. The PC release also comes packed with a number of additional visual and performance enhancing optimizations.\r\n\r\n\r\nFerocious monsters with unique ecologies\r\nHunt down a plethora of monsters with distinct behaviors and deadly ferocity. From classic returning monsters to all-new creatures inspired by Japanese folklore, including the flagship wyvern Magnamalo, you’ll need to think on your feet and master their unique tendencies if you hope to reap any of the rewards!\r\n\r\n\r\nChoose your weapon and show your skills\r\nWield 14 different weapon types that offer unique gameplay styles, both up-close and from long range. Charge up and hit hard with the devastating Great Sword; dispatch monsters in style using the elegant Long Sword; become a deadly maelstrom of blades with the speedy Dual Blades; charge forth with the punishing Lance; or take aim from a distance with the Bow and Bowguns. These are just a few of the weapon types available in the game, meaning you’re sure to find the play style that suits you best.\r\n\r\n\r\nHunt, gather and craft your way to the top of the food chain\r\nEach monster you hunt will provide materials that allow you to craft new weapons and armor and upgrade your existing gear. Go back out on the field and hunt even fiercer monsters and earn even better rewards! You can change your weapon at any of the Equipment Boxes any time, so the possibilities are limitless!\r\n\r\n\r\nHunt solo or team up to take monsters down\r\nThe Hunter Hub offers multiplayer quests where up to four players can team up to take on targets together. Difficulty scaling ensures that whether you go solo or hit the hunt as a full four-person squad, it’s always a fair fight.\r\n\r\n\r\nStunning visuals, unlocked framerate and other PC optimizations\r\nEnjoy beautiful graphics at up 4K resolution, HDR with support for features including ultrawide monitors and an unlocked frame rate make to make this a truly immersive monster-hunting experience. Hunters will also get immediate access to a number of free title updates that include new monsters, quests, gear and more.\r\n\r\n\r\nEnjoy an exciting new storyline set in Kamura Village\r\nThis serene locale is inhabited by a colorful cast of villagers who have long lived in fear of the Rampage - a catastrophic event where countless monsters attack the village all at once. 50 years after the last Rampage, you must work together with the villagers to face this trial.\r\n\r\n\r\nExperience new hunting actions with the Wirebug\r\nWirebugs are an integral part of your hunter’s toolkit. The special silk they shoot out can be used to zip up walls and across maps, and can even be used to pull off special attacks unique to each of the 14 weapon types in the game.\r\n\r\n\r\nBuddies are here to help\r\nThe Palico Felyne friends you already know and love from previous Monster Hunter adventures are joined by the brand new Palamute Canyne companions!\r\n\r\n\r\nWreak havoc by controlling monsters\r\nControl raging monsters using Wyvern Riding and dish out massive damage to your targets!\r\n\r\n\r\nFend off hordes of monsters in The Rampage\r\nProtect Kamura Village from hordes of monsters in an all-new quest type! Prepare for monster hunting on a scale like never before!', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 （64-bit）\r\nProcessor: Intel® Core™ i3-4130 or Core™ i5-3470 or AMD FX™-6100\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA® GeForce® GT 1030 (DDR4) or AMD Radeon™ RX 550\r\nDirectX: Version 12\r\nNetwork: Broadband Internet connection\r\nStorage: 36 GB available space\r\nAdditional Notes: 1080p/30fps when graphics settings are set to \"Low\". System requirements subject to change during game development.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 （64-bit）\r\nProcessor: Intel® Core™ i5-4460 or AMD FX™-8300\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA® GeForce® GTX 1060 (VRAM 3GB) or AMD Radeon™ RX 570 (VRAM 4GB)\r\nDirectX: Version 12\r\nNetwork: Broadband Internet connection\r\nStorage: 36 GB available space\r\nAdditional Notes: 1080p/30fps when graphics settings are set to \"Average\". System requirements subject to change during game development.', 'Monster Hunter Rise/Monster Hunter Rise-1.jpg', 'Monster Hunter Rise/Monster Hunter Rise-2.jpg', 'Monster Hunter Rise/Monster Hunter Rise-3.jpg', 'Monster Hunter Rise/Monster Hunter Rise-4.jpg', 1),
('GAME11', 'Riddle Joker', 19.99, 10, 'Riddle Joker is a Japanese-style visual novel produced by Yuzusoft, a Japanese developer of romance VNs.\r\nThe game won numerous awards on the year of its release in Japan for its art, music, and characters.\r\n\r\nStory:\r\n\r\nFor decades, superpowers and psychic abilities were thought to be mere science fiction, but the discovery of a certain particle called the \"Astron\" at the end of the 20th century proved to the world that these wondrous phenomena were real. Nowadays, these abilities have been dubbed \"astral abilities,\" with those who can wield them being knows as \"Astrals.\"\r\n\r\nArihara Satoru is but an ordinary person living in this futuristic world.\r\n\r\nHowever, beneath that guise, he\'s actually a secret agent working for an organization that uses Astrals.\r\n\r\nOne day, he receives a new mission:\r\n\r\nPose as a student and infiltrate a famous academy for Astrals.\r\n\r\nAfter successfully transferring into the academy together with his sister Arihara Nanami, he settles into his new life there, meeting new friends like his classmates Mitsukasa Ayase and Nijouin Hazuki, and his upperclassman Shikibe Mayu, among others.\r\n\r\nUntil an unfortunate accident leads to Mitsukasa Ayase finding out his true identity! And in that situation, he also learns that she has her own big secret...', 'OS: Windows 7 or newer\r\nProcessor: CPU 1.3GHz or more\r\nMemory: 2 GB RAM\r\nDirectX: Version 9.0c\r\nStorage: 8 GB available space', 'Processor: CPU 2.66GHz or more\r\nMemory: 4 GB RAM', 'Riddle Joker/rj-1.jpg', 'Riddle Joker/rj-2.jpg', 'Riddle Joker/rj-3.jpg', 'Riddle Joker/rj-4.jpg', 1),
('GAME12', 'Parquet', 15.99, 0, 'In the near future, a technology called Brain-Machine Interface connects the brain and machines. This technology brings about a new paradigm and opens the gates to the digitization of human memory itself.\r\nFrom these new discoveries, \"he\" is born. An illegal experiment mixes thousands of memories into a single vessel, creating a wholly new being.\r\nHaving only the memories of others, doubts about who he truly is start arising in his mind, until he gathers the courage to go out into the world in search of his true self.\r\nAs he steps into the real world, he meets two girls, Kido Tsubasa and Ibaraki Rino.\r\nBoth kind souls whose lives have been touched by unscrupulous BMI experiments, just like him.\r\nLearning to live together with their secrets, \"he\" and \"they\" will bring about big changes...', 'OS: Windows 7 or newer\r\nProcessor: 1.7 GHz or above\r\nMemory: 1 GB RAM\r\nGraphics: 1GB VRAM', 'OS: Windows 7 or newer\r\nProcessor: 1.7 GHz or above\r\nMemory: 1 GB RAM\r\nGraphics: 1GB VRAM', 'Parquet/parquet-1.jpg', 'Parquet/parquet-2.jpg', 'Parquet/parquet-3.jpg', 'Parquet/parquet-4.jpg', 1),
('GAME13', 'Grand Theft Auto V', 19.49, 10, 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld, the U.S. government and the entertainment industry, they must pull off a series of dangerous heists to survive in a ruthless city in which they can trust nobody, least of all each other.\r\n\r\nGrand Theft Auto V for PC offers players the option to explore the award-winning world of Los Santos and Blaine County in resolutions of up to 4k and beyond, as well as the chance to experience the game running at 60 frames per second.\r\n\r\nThe game offers players a huge range of PC-specific customization options, including over 25 separate configurable settings for texture quality, shaders, tessellation, anti-aliasing and more, as well as support and extensive customization for mouse and keyboard controls. Additional options include a population density slider to control car and pedestrian traffic, as well as dual and triple monitor support, 3D compatibility, and plug-and-play controller support.\r\n\r\nGrand Theft Auto V for PC also includes Grand Theft Auto Online, with support for 30 players and two spectators. Grand Theft Auto Online for PC will include all existing gameplay upgrades and Rockstar-created content released since the launch of Grand Theft Auto Online, including Heists and Adversary modes.\r\n\r\nThe PC version of Grand Theft Auto V and Grand Theft Auto Online features First Person Mode, giving players the chance to explore the incredibly detailed world of Los Santos and Blaine County in an entirely new way.\r\n\r\nGrand Theft Auto V for PC also brings the debut of the Rockstar Editor, a powerful suite of creative tools to quickly and easily capture, edit and share game footage from within Grand Theft Auto V and Grand Theft Auto Online. The Rockstar Editor’s Director Mode allows players the ability to stage their own scenes using prominent story characters, pedestrians, and even animals to bring their vision to life. Along with advanced camera manipulation and editing effects including fast and slow motion, and an array of camera filters, players can add their own music using songs from GTAV radio stations, or dynamically control the intensity of the game’s score. Completed videos can be uploaded directly from the Rockstar Editor to YouTube and the Rockstar Games Social Club for easy sharing.\r\n\r\nSoundtrack artists The Alchemist and Oh No return as hosts of the new radio station, The Lab FM. The station features new and exclusive music from the production duo based on and inspired by the game’s original soundtrack. Collaborating guest artists include Earl Sweatshirt, Freddie Gibbs, Little Dragon, Killer Mike, Sam Herring from Future Islands, and more. Players can also discover Los Santos and Blaine County while enjoying their own music through Self Radio, a new radio station that will host player-created custom soundtracks.', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 64 Bit, Windows 8.1 64 Bit, Windows 8 64 Bit, Windows 7 64 Bit Service Pack 1\r\nProcessor: Intel Core 2 Quad CPU Q6600 @ 2.40GHz (4 CPUs) / AMD Phenom 9850 Quad-Core Processor (4 CPUs) @ 2.5GHz\r\nMemory: 4 GB RAM\r\nGraphics: NVIDIA 9800 GT 1GB / AMD HD 4870 1GB (DX 10, 10.1, 11)\r\nStorage: 72 GB available space\r\nSound Card: 100% DirectX 10 compatible', 'Requires a 64-bit processor and operating system\r\nOS: Windows 10 64 Bit, Windows 8.1 64 Bit, Windows 8 64 Bit, Windows 7 64 Bit Service Pack 1\r\nProcessor: Intel Core i5 3470 @ 3.2GHz (4 CPUs) / AMD X8 FX-8350 @ 4GHz (8 CPUs)\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA GTX 660 2GB / AMD HD 7870 2GB\r\nStorage: 72 GB available space\r\nSound Card: 100% DirectX 10 compatible', 'GTA V/gta-1.jpg', 'GTA V/gta-2.jpg', 'GTA V/gta-3.jpg', 'GTA V/gta-4.jpg', 1),
('GAME14', 'Cyberpunk 2077', 29.99, 10, 'Cyberpunk 2077 is an action role-playing game developed and published by CD Projekt. Set in the dystopian Night City, the game follows the story of V, a customizable mercenary in a world obsessed with power, glamour, and body modification. Players explore an open world, interact with various characters, and make choices that influence the narrative.', 'These are the minimum specifications your computer needs to run the game. Meeting these requirements ensures that the game will run, but not necessarily at the highest settings.\r\nOperating System: Windows 7 or 10 (64-bit)\r\nProcessor: Intel Core i5-3570K or AMD FX-8310\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA GeForce GTX 780 or AMD Radeon RX 470\r\nStorage: 70 GB available space\r\n', 'These specifications are recommended for an optimal experience, allowing the game to run smoothly at higher settings.\r\nOperating System: Windows 10 (64-bit)\r\nProcessor: Intel Core i7-4790 or AMD Ryzen 3 3200G\r\nMemory: 12 GB RAM\r\nGraphics: NVIDIA GeForce GTX 1060 or AMD Radeon R9 Fury\r\nStorage: SSD with 70 GB available space', 'Cyberpunk 2077/cyber.jpg', 'Cyberpunk 2077/cyber1.jpg', 'Cyberpunk 2077/cyber2.jpg', 'Cyberpunk 2077/cyber3.jpg', 1),
('GAME15', 'Valheim', 19.99, 10, 'Valheim is a survival and exploration game developed by the indie studio Iron Gate AB. Set in a procedurally generated purgatory inspired by Norse mythology, players take on the role of a Viking warrior tasked with exploring and surviving the hostile lands. The game emphasizes cooperative multiplayer gameplay, allowing players to build structures, craft items, and battle creatures.', 'Valheim is known for its relatively low system requirements, making it accessible to a wide range of players.\r\nOperating System: Windows 7 or later (64-bit)\r\nProcessor: 2.6 GHz Dual-Core\r\nMemory: 4 GB RAM\r\nGraphics: GeForce GTX 500 series or equivalent\r\nStorage: 1 GB available space', 'These specifications are recommended for an optimal experience, allowing the game to run smoothly at higher settings.\r\nOperating System: Windows 7 or later (64-bit)\r\nProcessor: i5 3 GHz Quad-Core\r\nMemory: 8 GB RAM\r\nGraphics: GeForce GTX 970 series or equivalent\r\nStorage: 1 GB available space', 'Valheim/valheim.jpg', 'Valheim/valheim1.jpg', 'Valheim/valheim2.jpg', 'Valheim/valheim3.jpg', 1),
('GAME16', 'Deathloop', 59.99, 10, 'Deathloop is an action-adventure game developed by Arkane Studios and published by Bethesda Softworks. Set on the mysterious island of Blackreef, players assume the role of Colt, an assassin trapped in a time loop. The goal is to break the loop by eliminating eight targets within a single day. The game features a unique time loop mechanic, allowing players to explore different strategies and approaches to achieve their objectives.', 'As with other games, meeting the minimum system requirements ensures the game will run, but not necessarily at the highest settings.\r\nOperating System: Windows 10 (64-bit)\r\nProcessor: Intel Core i5-8400 or AMD Ryzen 5 1600\r\nMemory: 12 GB RAM\r\nGraphics: NVIDIA GTX 1060 or AMD Radeon RX 580\r\nStorage: 30 GB available space', 'These specifications are recommended for an optimal experience.\r\nOperating System: Windows 10 (64-bit)\r\nProcessor: Intel Core i7-9700K or AMD Ryzen 7 2700X\r\nMemory: 16 GB RAM\r\nGraphics: NVIDIA GTX 1660 Ti or AMD Radeon RX 590\r\nStorage: 30 GB available space', 'Deathloop/deathloop.jpg', 'Deathloop/deathloop1.jpg', 'Deathloop/deathloop2.jpg', 'Deathloop/deathloop3.jpg', 1),
('GAME17', 'It Takes Two', 11.99, 2, 'It Takes Two is a cooperative action-adventure game developed by Hazelight Studios and published by Electronic Arts. The game revolves around the story of Cody and May, a couple on the brink of divorce who find themselves magically transformed into dolls. Players control these dolls, navigating through a variety of imaginative and fantastical environments. The unique cooperative gameplay requires two players to work together to solve puzzles and overcome challenges, emphasizing the theme of cooperation and communication.', 'As It Takes Two is designed for cooperative gameplay, it requires two players, either locally or online.\r\nOperating System: Windows 8.1 (64-bit)\r\nProcessor: Intel Core i3-2100T or AMD FX 6100\r\nMemory: 8 GB RAM\r\nGraphics: NVIDIA GeForce GTX 660 or AMD Radeon R7 260x (DirectX 11 compatible GPU)\r\nStorage: 50 GB available space', 'Operating System: Windows 10 (64-bit)\r\nProcessor: Intel Core i5-8400 or AMD Ryzen 5 3600\r\nMemory: 16 GB RAM\r\nGraphics: NVIDIA GeForce GTX 970 or AMD Radeon RX 580 (DirectX 11 compatible GPU)\r\nStorage: 50 GB available space', 'It takes two/IT.jpg', 'It takes two/IT1.jpg', 'It takes two/IT2.jpg', 'It takes two/IT3.jpg', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_history`
--

CREATE TABLE `purchase_history` (
  `customer_id` varchar(10) NOT NULL,
  `game_id` varchar(10) NOT NULL,
  `code` varchar(16) NOT NULL,
  `description_id` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_history_description`
--

CREATE TABLE `purchase_history_description` (
  `id` varchar(10) NOT NULL,
  `method` varchar(15) DEFAULT NULL CHECK (`method` = 'MoMo wallet' or `method` = 'Online banking'),
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shopping_cart`
--

CREATE TABLE `shopping_cart` (
  `game_id` varchar(100) NOT NULL,
  `customer_id` varchar(10) NOT NULL,
  `amount` int(11) DEFAULT 1 CHECK (`amount` >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wishlist`
--

CREATE TABLE `wishlist` (
  `game_id` varchar(10) NOT NULL,
  `customer_id` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `wishlist`
--

INSERT INTO `wishlist` (`game_id`, `customer_id`) VALUES
('GAME09', 'CUSTOMER01');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `activation_code`
--
ALTER TABLE `activation_code`
  ADD PRIMARY KEY (`game_id`,`code`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Chỉ mục cho bảng `belongs_to`
--
ALTER TABLE `belongs_to`
  ADD PRIMARY KEY (`game_id`,`category_type`);

--
-- Chỉ mục cho bảng `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`type`);

--
-- Chỉ mục cho bảng `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Chỉ mục cho bảng `game`
--
ALTER TABLE `game`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `purchase_history`
--
ALTER TABLE `purchase_history`
  ADD PRIMARY KEY (`customer_id`,`game_id`,`code`,`description_id`),
  ADD KEY `game_id` (`game_id`,`code`);

--
-- Chỉ mục cho bảng `purchase_history_description`
--
ALTER TABLE `purchase_history_description`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD PRIMARY KEY (`game_id`,`customer_id`);

--
-- Chỉ mục cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`game_id`,`customer_id`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `purchase_history`
--
ALTER TABLE `purchase_history`
  ADD CONSTRAINT `purchase_history_ibfk_1` FOREIGN KEY (`game_id`,`code`) REFERENCES `activation_code` (`game_id`, `code`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
