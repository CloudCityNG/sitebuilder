-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Nov 04, 2014 at 10:51 AM
-- Server version: 5.5.25
-- PHP Version: 5.4.4

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `builderlite`
--


CREATE TABLE IF NOT EXISTS `ci_sessions` (
    `id` varchar(40) NOT NULL,
    `ip_address` varchar(45) NOT NULL,
    `timestamp` int(10) unsigned DEFAULT 0 NOT NULL,
    `data` blob NOT NULL,
    KEY `ci_sessions_timestamp` (`timestamp`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=14 ;

-- --------------------------------------------------------

--
-- Table structure for table `configuration`
--

CREATE TABLE `configuration` (
  `config_id` int(11) NOT NULL AUTO_INCREMENT,
  `config_name` varchar(255) NOT NULL,
  `config_value` text NOT NULL,
  `config_default` text NOT NULL,
  `config_description` text NOT NULL,
  `config_required` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=14 ;

--
-- Dumping data for table `configuration`
--

INSERT INTO `configuration` (`config_id`, `config_name`, `config_value`, `config_default`, `config_description`, `config_required`) VALUES
(1, 'elements_dir', 'elements', 'elements', '<h4>Elements Directory</h4>\r\n<p>\r\nThe directory where all your element HTML files are stored. This value is relative to the directory in which you installed the application. Do not add a trailing "/"\r\n</p>', 1),
(2, 'images_dir', 'elements/images', 'elements/images', '<h4>Image Directory</h4>\r\n<p>\r\nThis is the main directory for the images used by your elements. The images located in this directory belong to the administrator and can not be deleted by regular users. This directory needs to have <b>full read and write permissions!</b>\r\n</p>', 1),
(3, 'images_uploadDir', 'elements/images/uploads', 'elements/images/uploads', '<h4>Image Upload Directory</h4>\r\n<p>\r\nThis directory is used to store images uploaded by regular users. Each user will have his/her own directory within this directory. This directory needs to have <b>full read and write permissions!</b>.\r\n</p>', 1),
(4, 'upload_allowed_types', 'gif|jpg|png', 'gif|jpg|png', '<h4>Allowed Image Types</h4>\r\n<p>\r\nThe types of images users are allowed to upload, separated by "|".\r\n</p>', 1),
(5, 'upload_max_size', '1000', '1000', '<h4>Maximum Upload Filesize</h4>\r\n<p>\r\nThe maximum allowed filesize for images uploaded by users. This number is represents the number of kilobytes. Please note that this number of overruled by possible server settings.\r\n</p>', 1),
(6, 'upload_max_width', '1024', '1024', '<h4>Maximum Upload Width</h4>\r\n<p>\r\nThe maximum allowed width for images uploaded by users.\r\n</p>', 1),
(7, 'upload_max_height', '768', '768', '<h4>Maximum Upload Height</h4>\r\n<p>\r\nThe maximum allowed height for images uploaded by users.\r\n</p>', 1),
(8, 'images_allowedExtensions', 'jpg|png|gif|svg', 'jpg|png|gif|svg', '<h4>Allowed Extensions</h4>\r\n<p>\r\nThese allowed extensions are used when displayed the image library to the user, only these file types will be visible. \r\n</p>', 1),
(9, 'export_pathToAssets', 'elements/bootstrap|elements/css|elements/fonts|elements/images|elements/js', 'elements/bootstrap|elements/css|elements/fonts|elements/images|elements/js', '<h4>Assets Included in the export</h4>\r\n<p>\r\nThe collection of asset paths included in the export function. These paths are relative to the folder in which the application was installed and should have NO trailing "/". The paths are separated by "|".\r\n</p>', 0),
(10, 'export_fileName', 'website.zip', 'website.zip', '<h4>The Export File Name</h4>\r\n<p>\r\nThe name of the ZIP archive file downloaded when exporting a site. We recommend using the ".zip" file extension (others might work, but have not been tested).\r\n</p>', 1),
(12, 'index_page', 'index.php', 'index.php', '<h4>Index Page</h4>\r\n<p>\r\nSet to "index.php" by default. If you''d like to use pretty URLs (without "index.php" in them) leave this setting empty. If you want to use pretty URLs, don''t forget to update your ".htaccess" file as well (more information can be found in the provided documentation).\r\n</p>', 0),
(13, 'language', 'english', 'english', '<h4>Application Language</h4>\r\n<p>\r\n"english" by default. If you''re changing this to anything else, please be sure to have all required language files translated and located in the correct folder inside "/application/languages/yourlanguage".\r\n</p>', 1);

-- --------------------------------------------------------

--
-- Table structure for table `frames`
--

CREATE TABLE `frames` (
  `frames_id` int(11) NOT NULL AUTO_INCREMENT,
  `pages_id` int(11) NOT NULL,
  `sites_id` int(11) NOT NULL,
  `frames_content` text NOT NULL,
  `frames_height` int(4) NOT NULL,
  `frames_original_url` varchar(255) NOT NULL,
  `frames_loaderfunction` varchar(255) NOT NULL,
  `frames_sandbox` int(1) NOT NULL DEFAULT '0',
  `frames_timestamp` int(11) NOT NULL,
  `frames_global` int(1) NOT NULL DEFAULT '0',
  `revision` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`frames_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=19 ;

--
-- Dumping data for table `frames`
--

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Administrator'),
(2, 'members', 'General User');

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(15) NOT NULL,
  `login` varchar(100) NOT NULL,
  `time` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `pages_id` int(11) NOT NULL AUTO_INCREMENT,
  `sites_id` int(11) NOT NULL,
  `pages_name` varchar(255) NOT NULL,
  `pages_timestamp` int(11) NOT NULL,
  `pages_title` varchar(255) NOT NULL,
  `pages_meta_keywords` text NOT NULL,
  `pages_meta_description` text NOT NULL,
  `pages_header_includes` text NOT NULL,
  `pages_preview` text NOT NULL,
  `pages_template` int(1) NOT NULL DEFAULT '0',
  `pages_css` text NOT NULL,
  PRIMARY KEY (`pages_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;


--
-- Table structure for table `sites`
--

CREATE TABLE `sites` (
  `sites_id` int(11) NOT NULL AUTO_INCREMENT,
  `users_id` int(11) NOT NULL,
  `sites_name` varchar(255) NOT NULL,
  `sites_created_on` varchar(100) NOT NULL,
  `sites_lastupdate_on` varchar(100) NOT NULL,
  `ftp_server` varchar(255) NOT NULL,
  `ftp_user` varchar(255) NOT NULL,
  `ftp_password` varchar(255) NOT NULL,
  `ftp_path` varchar(255) NOT NULL DEFAULT '/',
  `ftp_port` int(8) NOT NULL DEFAULT '21',
  `ftp_ok` int(1) NOT NULL,
  `ftp_published` int(1) NOT NULL DEFAULT '0',
  `publish_date` int(11) NOT NULL DEFAULT '0',
  `global_css` text NOT NULL,
  `remote_url` varchar(255) NOT NULL,
  `sites_trashed` int(1) NOT NULL DEFAULT '0',
  `viewmode` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`sites_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;


-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(15) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `activation_code` varchar(40) DEFAULT NULL,
  `forgotten_password_code` varchar(40) DEFAULT NULL,
  `forgotten_password_time` int(11) unsigned DEFAULT NULL,
  `remember_code` varchar(40) DEFAULT NULL,
  `created_on` int(11) unsigned NOT NULL,
  `last_login` int(11) unsigned DEFAULT NULL,
  `active` tinyint(1) unsigned DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `ip_address`, `username`, `password`, `salt`, `email`, `activation_code`, `forgotten_password_code`, `forgotten_password_time`, `remember_code`, `created_on`, `last_login`, `active`, `first_name`, `last_name`, `company`, `phone`) VALUES
(1, '127.0.0.1', 'administrator', '2e2584d015dd0cf71e6aeb479e88f67d3a38a23a', '', 'admin@admin.com', '', 'dxnzUHfswcGW5rBvePVaYe195a1d150c1c4cf188', 1413253659, 'B/PgjtSdYXXN/LZH5GQWre', 1268889823, 1415070651, 1, 'Mr', 'Admin', 'ADMIN', '0');

-- --------------------------------------------------------

--
-- Table structure for table `users_groups`
--

CREATE TABLE `users_groups` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `group_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_users_groups` (`user_id`,`group_id`),
  KEY `fk_users_groups_users1_idx` (`user_id`),
  KEY `fk_users_groups_groups1_idx` (`group_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `users_groups`
--

INSERT INTO `users_groups` (`id`, `user_id`, `group_id`) VALUES
(1, 1, 1),
(2, 1, 2);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `users_groups`
--
ALTER TABLE `users_groups`
  ADD CONSTRAINT `fk_users_groups_groups1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_users_groups_users1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
