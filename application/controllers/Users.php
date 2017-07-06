<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Users extends MY_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->library('ion_auth');
		$this->load->helper('url');
		$this->load->helper('form');
		$this->load->library('form_validation');
		
		$this->load->model('sitemodel');
		$this->load->model('usermodel');
		
		$this->data['pageTitle'] = $this->lang->line('sites_page_title');
				
		if(!$this->ion_auth->logged_in()) {
			
			redirect('/login');
		
		}
		
	}

	/*
		
		main user page, lists all users
		
	*/
	
	public function index() {
		
		if( !$this->ion_auth->is_admin() ) {
		
			die('You need to be admin to do this');
		
		}
	
		//get all users plusn their sites
		$this->data['users'] = $this->usermodel->getUsersPlusSites();
	
		$this->data['page'] = "users";
		$this->load->view('users/users', $this->data);
	
	}
	
	
	
	/*
	
		creates a new user account
	
	*/
	
	public function create() {
		
		if( !$this->ion_auth->is_admin() ) {
		
			die('You need to be admin to do this');
		
		}
	
		$this->form_validation->set_rules('firstname', 'First name', 'required');
		$this->form_validation->set_rules('lastname', 'Last name', 'required');
		$this->form_validation->set_rules('email', 'Email', 'required|valid_email');
		$this->form_validation->set_rules('password', 'Password', 'required');
	
		if ($this->form_validation->run() == FALSE) {
			
			//all did not go well
			$return = array();
			
			$temp = array();
			$temp['header'] = $this->lang->line('users_create_error1_heading');
			$temp['content'] = $this->lang->line('users_create_error1_message').validation_errors();
			
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		} else {
		
			
			//make sure the email address is allowed
			if( $this->ion_auth->email_check($_POST['email']) ) {
			
				//all did not go well
				$return = array();
				
				$temp = array();
				$temp['header'] = $this->lang->line('users_create_error1_heading');
				$temp['content'] = $this->lang->line('users_create_error2_message');
				
				$return['responseCode'] = 0;
				$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			}
			
			
			//create the account
			
			if( isset($_POST['isAdmin']) ) {//new account is admin
			
				//email activation?
				if( isset($_POST['notify']) && $_POST['notify'] == 'yes' ) {
				
					$this->ion_auth->register($_POST['email'], $_POST['password'], $_POST['email'], array('first_name'=>$_POST['firstname'], 'last_name'=>$_POST['lastname']), array('1'), true);
				
				} else {
				
					$this->ion_auth->register($_POST['email'], $_POST['password'], $_POST['email'], array('first_name'=>$_POST['firstname'], 'last_name'=>$_POST['lastname']), array('1'), false);
				
				}
			
			
			} else {//not admin
			
				//email activation?
				if( isset($_POST['notify']) && $_POST['notify'] == 'yes' ) {
				
					$this->ion_auth->register($_POST['email'], $_POST['password'], $_POST['email'], array('first_name'=>$_POST['firstname'], 'last_name'=>$_POST['lastname']), array('2'), true);
				
				} else {
				
					$this->ion_auth->register($_POST['email'], $_POST['password'], $_POST['email'], array('first_name'=>$_POST['firstname'], 'last_name'=>$_POST['lastname']), array('2'), false);
				
				}
			
			
			}
			
		
			//all good then
			$return = array();
			
			//include users in the return as well
			$return['users'] = $this->load->view('partials/users', array('users'=>$this->usermodel->getUsersPlusSites()), true);
			
			$temp = array();
			$temp['header'] = $this->lang->line('users_create_success_heading');
			$temp['content'] = $this->lang->line('users_create_success_message');
			
			$return['responseCode'] = 1;
			$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		}
	
	}
	
	
	
	/*
	
		updates existing user
		
	*/
	
	public function update() {
		
		if( !$this->ion_auth->is_admin() ) {
		
			die('You need to be admin to do this');
		
		}
		
		$this->form_validation->set_rules('userID', 'User ID', 'required');
		$this->form_validation->set_rules('email', 'Email', 'required|valid_email');
		$this->form_validation->set_rules('password', 'Password', 'required');
	
		if ($this->form_validation->run() == FALSE) {
			
			//all did not go well
			$return = array();
			
			$temp = array();
			$temp['header'] = $this->lang->line('users_update_error1_heading');
			$temp['content'] = $this->lang->line('users_update_error1_message').validation_errors();
			
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		} else {
		
			//make sure the email address is allowed
			
			$user = $this->ion_auth->user($_POST['userID'])->row();
			
			if( $_POST['email'] != $user->email && $this->ion_auth->email_check($_POST['email']) ) {
			
			//if( $_POST['email'] === $user->username || $_POST['email'] === $user->email || $this->ion_auth->identity_check($_POST['email']) === FALSE ) {
			
				//all did not go well
				$return = array();
				
				$temp = array();
				$temp['header'] = $this->lang->line('users_update_error2_heading');
				$temp['content'] = $this->lang->line('users_update_error2_message');
				
				$return['responseCode'] = 0;
				$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			}
			
			
			//update the account details
			
			$this->ion_auth->update($_POST['userID'], array('email'=>$_POST['email'], 'password'=>$_POST['password']));
			
			
			//admin?
			
			if( isset($_POST['isAdmin']) && $_POST['isAdmin'] == 'yes' ) {
			
				$this->ion_auth->add_to_group(1, $_POST['userID']);
			
			} else {
			
				$this->ion_auth->remove_from_group(1, $_POST['userID']);
				
			}
			
			
			//all good then
			$return = array();
			
			
			//return the user details form as well
			
			$userStuff = $this->usermodel->getUsersPlusSites( $_POST['userID'] );
			
			$return['userDetailForm'] = $this->load->view('partials/userdetailsform', array('user'=>$userStuff[0]), true);
			
						
			$temp = array();
			$temp['header'] = $this->lang->line('users_update_success_heading');
			$temp['content'] = $this->lang->line('users_update_success_message');
			
			$return['responseCode'] = 1;
			$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		}
	
	}
	
	
	
	/*
	
		perfor a manualy user pw reset email
	
	*/
	
	public function rpw($userID = '') {
		
		if( !$this->ion_auth->is_admin() ) {
		
			die('You need to be admin to do this');
		
		}
	
		if( $userID == '' || $userID == 'undefined' ) {
		
			//error, missing userID
			//all did not go well
			$return = array();
			
			$temp = array();
			$temp['header'] = "Ouch! Something went wrong:";
			$temp['content'] = "Some important data is missing. Please reload this page and try again.";
			
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
			
		
		}
		
		
		//guess all is well :), send email
		
		$user = $this->ion_auth->user($userID)->row();
		
		$forgotten = $this->ion_auth->forgotten_password( $user->email );
		
		if( $forgotten ) {//email sent
		
			$return = array();
						
			$temp = array();
			$temp['header'] = "Hooray!";
			$temp['content'] = "A reset password email was sent to <b>".$user->email."</b>.";
			
			$return['responseCode'] = 1;
			$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		} else {//email not sent
		
			$return = array();
			
			$temp = array();
			$temp['header'] = "Ouch! Something went wrong:";
			$temp['content'] = "Something went wrong when trying to sent the password reset email, please see the errors below:<br>".$this->ion_auth->errors();
			
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		}
	
	}
	
	
	
	/*
	
		deletes an entire user account, incl sites and other data
	
	*/
	
	public function delete($userID = '') {
		
		if( !$this->ion_auth->is_admin() ) {
		
			die('You need to be admin to do this');
		
		}
	
		
		//start by deleting all sites for this user
		
		$this->sitemodel->deleteAllFor( $userID );
		
		
		//now delete the user account
		
		if( $this->ion_auth->delete_user( $userID ) ) {
		
			//deleted
			$this->session->set_flashdata('success', "The user account has been deleted.");
			
			redirect('/users/', 'refresh');
		
		} else {
		
			//not deleted
			$this->session->set_flashdata('error', "The user's sites were deleted, but we couldn't remove the user account. Please reload and try again.");
			
			redirect('/users/', 'refresh');
		
		}
	
	} 
	
	
	
	/*
	
		update account first name and last name
	
	*/
	
	public function uaccount() {
		
		$user = $this->ion_auth->user()->row();
		
		if( $user->id != $_POST['userID'] ) {
		
			die('You must be the account owner to do this');
		
		}
	
		$this->form_validation->set_rules('userID', 'User ID', 'required');
		$this->form_validation->set_rules('firstname', 'First name', 'required');
		$this->form_validation->set_rules('lastname', 'Last name', 'required');
		
		
		if ($this->form_validation->run() == FALSE) {
			
			//all did not go well
			$return = array();
			
			$temp = array();
			$temp['header'] = "Ouch! Something went wrong:";
			$temp['content'] = "Something went wrong when trying to update your details, please see the errors below:<br><br>".validation_errors();
			
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		} else {
		
			//all well, update user details
			
			$data = array(
				'first_name' => $_POST['firstname'],
				'last_name' => $_POST['lastname']
			);
			
			if( $this->ion_auth->update($_POST['userID'], $data) ) {
			
				//saved ok
				$return = array();
							
				$temp = array();
				$temp['header'] = "Hooray!";
				$temp['content'] = "Your account details were updated successfully.";
				
				$return['responseCode'] = 1;
				$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			} else {
			
				//not saved
				//all did not go well
				$return = array();
				
				$temp = array();
				$temp['header'] = "Ouch! Something went wrong:";
				$temp['content'] = "We weren't able to save your details just now. Please reload the page and try again.";
				
				$return['responseCode'] = 0;
				$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			}
		
		}
	
	}
	
	
	
	/*
		
		updates an account's login credential
		
	*/
	
	public function ulogin() {
		
		$user = $this->ion_auth->user()->row();
		
		if( $user->id != $_POST['userID'] ) {
		
			die('You must be the account owner to do this');
		
		}
		
		$this->form_validation->set_rules('userID', 'User ID', 'required');
		$this->form_validation->set_rules('email', 'Email', 'required|valid_email');
		$this->form_validation->set_rules('password', 'Password', 'required');
		
		
		if ($this->form_validation->run() == FALSE) {
			
			//all did not go well
			$return = array();
			
			$temp = array();
			$temp['header'] = "Ouch! Something went wrong:";
			$temp['content'] = "Something went wrong when trying to update your details, please see the errors below:<br><br>".validation_errors();
			
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
			
			die( json_encode( $return ) );
		
		} else {
		
			//all well, update user details
			
			$data = array(
				'email' => $_POST['email'],
				'password' => $_POST['password']
			);
			
			if( $this->ion_auth->update($_POST['userID'], $data) ) {
			
				//saved ok
				$return = array();
							
				$temp = array();
				$temp['header'] = "Hooray!";
				$temp['content'] = "Your account details were updated successfully.";
				
				$return['responseCode'] = 1;
				$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			} else {
			
				//not saved
				//all did not go well
				$return = array();
				
				$temp = array();
				$temp['header'] = "Ouch! Something went wrong:";
				$temp['content'] = "We weren't able to save your details just now. Please reload the page and try again.";
				
				$return['responseCode'] = 0;
				$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);
				
				die( json_encode( $return ) );
			
			}
		
		}
	
	}
	
	
	/*
	
		enables a disabled user account
	
	*/
	
	public function enable($userID) {
		
		if( !$this->ion_auth->is_admin() ) {
		
			die('You need to be admin to do this');
		
		}
		
		//activate user account
		$this->ion_auth->activate($userID);
		
		$this->session->set_flashdata('success', "The user account has been activated; this user can now login and create web sites.");
		
		redirect('/users/', 'refresh');
		
	}
	
	
	/*
		
		disabled an enabled user account
	
	*/
	
	public function disable($userID) {
		
		if( !$this->ion_auth->is_admin() ) {
		
			die('You need to be admin to do this');
		
		}
		
		//activate user account
		$this->ion_auth->deactivate($userID);
		
		$this->session->set_flashdata('success', "The user account has been de-activated; this user can no longer login.");
		
		redirect('/users/', 'refresh');
		
	}
	
}

/* End of file users.php */
/* Location: ./application/controllers/users.php */