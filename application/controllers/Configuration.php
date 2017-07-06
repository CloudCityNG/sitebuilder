<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Configuration extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->library('ion_auth');
		$this->load->helper('url');
		$this->load->helper('form');
		$this->load->library('form_validation');
		
		$this->load->model('configmodel');
			
		$this->data['pageTitle'] = '';
				
	}
	
	
	/*
		
		used by the pre_controller hook to dynamically set the config items
		
	*/
	
	/*public function load() {
		
		//grab configuration from the database
		
		$config = $this->configmodel->getConfig();
		
		foreach( $config as $configItem ) {
					
			$this->config->set_item($configItem->config_name, $configItem->config_value);
			
		}
		
	}*/
	
	
	
	/*
		
		loads the settings page
		
	*/
	
	public function index() {
	
		if(!$this->ion_auth->logged_in()) {
			
			redirect('/login');
		
		}
		
		if( !$this->ion_auth->is_admin() ) {
			
			redirect('/sites');
			
		}
	
		//grab our config settings from the DB
		$this->data['settings'] = $this->configmodel->getConfig();
		
		$this->data['page'] = "settings";
		$this->load->view('settings/settings', $this->data);
		
	}
	
	
	/*
		
		updates the configuration settings
		
	*/
	
	public function update() {
	
		if(!$this->ion_auth->logged_in()) {
			
			redirect('/login');
		
		}
		
		$this->form_validation->set_rules('elements_dir', 'elements_dir', 'required');
		$this->form_validation->set_rules('images_dir', 'images_dir', 'required');
		$this->form_validation->set_rules('images_uploadDir', 'images_uploadDir', 'required');
		$this->form_validation->set_rules('upload_allowed_types', 'upload_allowed_types', 'required');
		$this->form_validation->set_rules('upload_max_size', 'upload_allowed_types', 'required|numeric');
		$this->form_validation->set_rules('upload_max_width', 'upload_max_width', 'required|numeric');
		$this->form_validation->set_rules('upload_max_height', 'upload_max_height', 'required|numeric');
		$this->form_validation->set_rules('images_allowedExtensions', 'images_allowedExtensions', 'required');
		$this->form_validation->set_rules('export_fileName', 'export_fileName', 'required');
		$this->form_validation->set_rules('language', 'language', 'required');
		
		if ($this->form_validation->run() == FALSE) {
					
			//some errors :(
			$this->session->set_flashdata('error', $this->lang->line('assets_update_error').validation_errors());
		
		} else {
					
			//all good :)
			
			//update the data
			$this->configmodel->updateConfig($_POST);
			
			$this->session->set_flashdata('success', $this->lang->line('assets_update_success'));
			
		}
		
		redirect('settings', 'location');
		
	}
	
}

/* End of file configuration.php */
/* Location: ./application/controllers/configuration.php */