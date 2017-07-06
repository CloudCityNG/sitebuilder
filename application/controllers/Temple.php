<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Temple extends MY_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->library('ion_auth');
		$this->load->helper('url');
		$this->load->model('pagemodel');
				
		/*if(!$this->ion_auth->logged_in()) {
			
			redirect('/login');
		
		}*/
		
	}
	
	/*
		
		grabs all the frames for a single page, mixes these into the skeleton.html file and echos the final output
		
	*/
	
	public function index($pageID) {
	
		$this->pagemodel->loadPage($pageID);
				
	}
	
}

/* End of file temple.php */
/* Location: ./application/controllers/temple.php */