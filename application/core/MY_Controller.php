<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MY_Controller extends CI_Controller {
    function __construct()
    {
        parent::__construct();
        
        $this->load->model('configmodel');
        
        $config = $this->configmodel->getConfig();
		
		foreach( $config as $configItem ) {
					
			$this->config->set_item($configItem->config_name, $configItem->config_value);
			
		}
        
    }
}