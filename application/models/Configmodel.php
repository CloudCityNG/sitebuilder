<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Configmodel extends CI_Model {

    function __construct()
    {
        parent::__construct();
        
        $this->load->database();
        $this->load->library('session');
        $this->load->library('ion_auth');
        
    }
    
    
    /*
	    
	    retrieves the configuration from the DB
	    
    */
    
    public function getConfig() {
	    
	    $q = $this->db->get('configuration');
	    
	    return $q->result();
	    
    }
    
    
    
    /*
	    
	    updates the configuration settings
	    
    */
    
    public function updateConfig($configData) {
	    
	    //elements_dir
	    $data = array(
        	'config_value' => $configData['elements_dir']
        );

        $this->db->where('config_id', 1);
        $this->db->update('configuration', $data); 
        
        
        
        //images_dir
	    $data = array(
        	'config_value' => $configData['images_dir']
        );

        $this->db->where('config_id', 2);
        $this->db->update('configuration', $data); 
        
        
        //images_uploadDir
	    $data = array(
        	'config_value' => $configData['images_uploadDir']
        );

        $this->db->where('config_id', 3);
        $this->db->update('configuration', $data);
        
        
        //upload_allowed_types
	    $data = array(
        	'config_value' => $configData['upload_allowed_types']
        );

        $this->db->where('config_id', 4);
        $this->db->update('configuration', $data);
        
        
        //upload_max_size
	    $data = array(
        	'config_value' => $configData['upload_max_size']
        );

        $this->db->where('config_id', 5);
        $this->db->update('configuration', $data);
        
        
        //upload_max_width
	    $data = array(
        	'config_value' => $configData['upload_max_width']
        );

        $this->db->where('config_id', 6);
        $this->db->update('configuration', $data);
        
        
        //upload_max_height
	    $data = array(
        	'config_value' => $configData['upload_max_height']
        );

        $this->db->where('config_id', 7);
        $this->db->update('configuration', $data);
        
        
        //images_allowedExtensions
	    $data = array(
        	'config_value' => $configData['images_allowedExtensions']
        );

        $this->db->where('config_id', 8);
        $this->db->update('configuration', $data); 
        
        
        //export_pathToAssets
	    $data = array(
        	'config_value' => $configData['export_pathToAssets']
        );

        $this->db->where('config_id', 9);
        $this->db->update('configuration', $data); 
        
        
        //export_fileName
	    $data = array(
        	'config_value' => $configData['export_fileName']
        );

        $this->db->where('config_id', 10);
        $this->db->update('configuration', $data);
        
        
        //index_page
	    $data = array(
        	'config_value' => $configData['index_page']
        );

        $this->db->where('config_id', 12);
        $this->db->update('configuration', $data);
        
        
        //language
	    $data = array(
        	'config_value' => $configData['language']
        );

        $this->db->where('config_id', 13);
        $this->db->update('configuration', $data); 
	    
    }
    
}