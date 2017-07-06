<?php

class Core {

	// Function to validate the post data
	function validate_post($data)
	{
		
		//valid email address?
		
		if( !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
		     return false;
		}
	
		/* Validating the hostname, the database name and the username. The password is optional. */
		return !empty($data['hostname']) && !empty($data['password_admin']) && !empty($data['username']) && !empty($data['database']) && !empty($data['base_url']);
	}

	// Function to show an error
	function show_message($type,$message) {
		return $message;
	}

	// Function to write the config file
	function write_config($data) {

		// Config path
		$template_path 	= 'config/database.php';
		$output_path 	= '../application/config/database.php';
		
		$config_template = 'config/config.php';
		$config_output = '../application/config/config.php';

		// Open the file
		$database_file = file_get_contents($template_path);

		$new  = str_replace("%HOSTNAME%",$data['hostname'],$database_file);
		$new  = str_replace("%USERNAME%",$data['username'],$new);
		$new  = str_replace("%PASSWORD%",$data['password'],$new);
		$new  = str_replace("%DATABASE%",$data['database'],$new);

		// Write the new database.php file
		$handle = fopen($output_path,'w+');

		// Chmod the file, in case the user forgot
		@chmod($output_path,0777);

		// Verify file permissions
		if(is_writable($output_path)) {

			// Write the file
			if(fwrite($handle,$new)) {
				//return true;
			} else {
				return false;
			}

		} else {
			return false;
		}
		
		
		
		// Open the file
		$config_file = file_get_contents($config_template);

		$new  = str_replace("%BASE_URL%", $data['base_url'], $config_file);
		
		// Write the new config.php file
		$handle = fopen($config_output, 'w+');

		// Chmod the file, in case the user forgot
		@chmod($config_output, 0777);

		// Verify file permissions
		if(is_writable($config_output)) {
			
			// Write the file
			if(fwrite($handle, $new)) {
				return true;
			} else {
				return false;
			}

		} else {
			return false;
		}
		
	}
}