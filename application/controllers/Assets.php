<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Assets extends MY_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->library('ion_auth');
		$this->load->helper('url');
		$this->load->helper('directory');
		
		$this->load->model('usermodel');
		$this->load->model('sitemodel');
			
		$this->data['pageTitle'] = $this->lang->line('sites_page_title');
	
		if(!$this->ion_auth->logged_in()) {
			
			redirect('/login');
		
		}
		
	}

	public function index() {
	
		
		
	}
	
	public function images() {
		
		//load user images
		
		$user = $this->ion_auth->user()->row();
		
		$userID = $user->id;
		
		$userImages = $this->usermodel->getUserImages( $userID );
		
		if( $userImages ) {
		
			$this->data['userImages'] = $userImages;
		
		}
	
		
		//load admin images		
		
		$adminImages = $this->sitemodel->adminImages();
		
		if( $adminImages ) {
		
			$this->data['adminImages'] = $adminImages;
		
		}
		
		$this->data['userID'] = $userID;
	
		$this->data['page'] = "images";
		$this->load->view('assets/images', $this->data);
	
	}
	
	
	
	/*
		
		takes an incoming form with file upload
		
	*/
	
	public function imageUpload() {
	
		$user = $this->ion_auth->user()->row();
		
		$userID = $user->id;
		
		
		//if the upload path does not exist, create it
		
		if( !file_exists( './'.$this->config->item('images_uploadDir').'/'.$userID ) ) {
		
			mkdir('./'.$this->config->item('images_uploadDir').'/'.$userID, 0777, true);
		
		}
		
	
		$config['upload_path'] = './'.$this->config->item('images_uploadDir').'/'.$userID.'/';
		$config['allowed_types'] = $this->config->item('upload_allowed_types');
		$config['max_size']	= $this->config->item('upload_max_size');
		$config['max_width']  = $this->config->item('upload_max_width');
		$config['max_height']  = $this->config->item('upload_max_height');
		
		$this->load->library('upload', $config);
		
		if ( ! $this->upload->do_upload('userFile')) {
					
			$this->session->set_flashdata('error', $this->upload->display_errors());
				
		} else {
			
			$this->session->set_flashdata('success', 1);
		
		}
		
		redirect('/assets/images', 'location');
	
	}
	
	
	
	/*
	
		takes an incoming form with image via Ajax
		
	*/
	
	public function imageUploadAjax($siteID) {
	
		$user = $this->ion_auth->user()->row();
			
		$userID = $user->id;
			
			
		//if the upload path does not exist, create it
			
		if( !file_exists( './'.$this->config->item('images_uploadDir').'/'.$userID ) ) {
			
			mkdir('./'.$this->config->item('images_uploadDir').'/'.$userID, 0777, true);
			
		}
			
		
		$config['upload_path'] = './'.$this->config->item('images_uploadDir').'/'.$userID.'/';
		$config['allowed_types'] = $this->config->item('upload_allowed_types');
		$config['max_size']	= $this->config->item('upload_max_size');
		$config['max_width']  = $this->config->item('upload_max_width');
		$config['max_height']  = $this->config->item('upload_max_height');
			
		$this->load->library('upload', $config);
			
		if ( ! $this->upload->do_upload('imageFile')) {
									
			$return = array();
				
			$temp = array();
			$temp['header'] = $this->lang->line('assets_imageUploadAjax_error1_heading');
			$temp['content'] = $this->lang->line('assets_imageUploadAjax_error1_message').$this->upload->display_errors();
				
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
				
			die( json_encode( $return ) );
					
		} else {
				
			$return = array();
				
			$temp = array();
			$temp['header'] = $this->lang->line('assets_imageUploadAjax_success_heading');
			$temp['content'] = $this->lang->line('assets_imageUploadAjax_success_message');
			
			
			//include the partils "myimages" with all the uploaded images
			
			
			$userID = $user->id;
			
			$userImages = $this->usermodel->getUserImages( $userID );
			
			if( $userImages ) {
			
				$siteData = $this->sitemodel->getSite($siteID);
							
				$return['myImages'] = $this->load->view('partials/myimages', array('userImages'=>$userImages,'siteData'=>$siteData), true);
			
			}
			
			
			
				
			$return['responseCode'] = 1;
			$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
			
		}
				
	}
	
	
	
	
	/*
		removes a single user image
	*/
	
	public function delImage() {
	
		if( isset($_POST['file']) && $_POST['file'] != '' ) {
		
			
			$user = $this->ion_auth->user()->row();
			
			$userID = $user->id;
			
		
			//disect the URL
			
			$temp = explode("/", $_POST['file']);
			
			$fileName = array_pop( $temp );
			
			$userDirID = array_pop( $temp );
			
			
			//make sure this is the user's images
			
			if( $userID == $userDirID ) {
			
				//all good, remove!
				unlink( './'.$this->config->item('images_uploadDir').'/'.$userID.'/'.$fileName );
			
			}
		
		}
	
	}
	
}

/* End of file assets.php */
/* Location: ./application/controllers/assets.php */