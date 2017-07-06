<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Ftpconnection extends MY_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->library('ion_auth');
		$this->load->helper('url');
		
		$this->load->library('ftp');
		
		$this->load->model('ftpmodel');
			
		if(!$this->ion_auth->logged_in()) {
			
			redirect('/login');
		
		}
		
	}
	
	
	/*
		
		connects FTP and returns a list of files/folders
		
	*/

	public function connect()
	{
	
		$config['hostname'] = $_POST['siteSettings_ftpServer'];
		$config['username'] = $_POST['siteSettings_ftpUser'];
		$config['password'] = $_POST['siteSettings_ftpPassword'];
		$config['port'] = $_POST['siteSettings_ftpPort'];
		$config['debug'] = FALSE;
		
		
		if ($this->ftp->connect($config)) {
			
			$path = ( $_POST['siteSettings_ftpPath'] != '' )? $_POST['siteSettings_ftpPath'] : "/";
			
			$list = $this->ftp->list_files( $path );
			
			if( $list ) {
			
				$return = array();
			
				$temp = array();
				$temp['list'] = $list;
				$temp['data'] = $_POST;
			
				$return['responseCode'] = 1;
				$return['responseHTML'] = $this->load->view('partials/ftplist', array('data'=>$temp), true);
			
				die( json_encode( $return ) );
			
			} else {
			
				$return = array();
				
				$temp = array();
				$temp['header'] = $this->lang->line('ftpconnecton_connect_error1_heading');
				$temp['content'] = $this->lang->line('ftpconnecton_connect_error1_message');
				
				$return['responseCode'] = 0;
				$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			}
		
		} else {
			
			$return = array();
			
			$temp = array();
			$temp['header'] = $this->lang->line('ftpconnecton_connect_error2_heading');
			$temp['content'] = $this->lang->line('ftpconnecton_connect_error2_message');
			
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		}
		
		
	}
	
	
	
	/*
		
		tests an FTP connection and verifies it's details
		
	*/
	
	public function test() {
	
		//test ftp settings
		
		$path = ( $_POST['siteSettings_ftpPath'] != '' )? $_POST['siteSettings_ftpPath'] : "/";
		
		$result = $this->ftpmodel->test( $_POST['siteSettings_ftpServer'], $_POST['siteSettings_ftpUser'], $_POST['siteSettings_ftpPassword'], $_POST['siteSettings_ftpPort'], $path );
		
		$return = array();
		
		
		if( $result['connection'] ) {//all good
					
			$temp = array();
			$temp['header'] = $this->lang->line('ftpconnection_test_success_heading');
			$temp['content'] = $this->lang->line('ftpconnection_test_success_message');
			
			$return['responseCode'] = 1;
			$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		} else {
		
			if( $result['problem'] == 'connection' ) {//connection detais failed
			
				$temp = array();
				$temp['header'] = $this->lang->line('ftpconnection_test_error1_heading');
				$temp['content'] = $this->lang->line('ftpconnection_test_error1_message');
				
				$return['responseCode'] = 0;
				$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			} elseif( $result['problem'] == 'path' ) {//path failed
			
				$temp = array();
				$temp['header'] = $this->lang->line('ftpconnection_test_error2_heading');
				$temp['content'] = $this->lang->line('ftpconnection_test_error2_message');
				
				$return['responseCode'] = 0;
				$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			}
		
		}
	
	}
}

/* End of file ftpconnection.php */
/* Location: ./application/controllers/ftpconnection.php */