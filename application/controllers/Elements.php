<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Elements extends MY_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->library('ion_auth');
		$this->load->helper('url');
		
		$this->load->model('sitemodel');
			
		$this->data['pageTitle'] = $this->lang->line('sites_page_title');
	
		if(!$this->ion_auth->logged_in()) {
			
			redirect('/login');
		
		}
		
	}

	/*
		
		gets the content of a saved frame and sends it back to the browser
		
	*/
	
	public function getframe($frameID) {
	
		$frame = $this->sitemodel->getSingleFrame($frameID);
		
		echo $frame->frames_content;
	
	}
	
}

/* End of file getelements.php */
/* Location: ./application/controllers/getelements.php */