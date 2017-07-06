<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Ftpmodel extends CI_Model {

    function __construct()
    {
        parent::__construct();
        
        $this->load->database();
        $this->load->library('session');
        $this->load->library('ion_auth');
        $this->load->library('ftp');
        
    }
    
    
    /*
    
    	tests wether or not a FTP connection can be made and wether or not the path is ok
    
    */
    
    public function test($server, $user, $pass, $port, $path) {
    
    	$return = array();//return array
    	
    	$config['hostname'] = $server;
    	$config['username'] = $user;
    	$config['password'] = $pass;
    	$config['port'] = $port;
    	$config['debug'] = FALSE;
    	
    	
    	if ( $this->ftp->connect($config) ) {//connection is ok
    	
    		//test the path
    		$list = $this->ftp->list_files( $path );
    		
    		if( $list ) {
    			
    			$return['connection'] = true;
    		
    		} else {
    			
    			$return['connection'] = false;
    			$return['problem'] = "path";
    		
    		}
    	
    	} else {//connection failed
    	
    		$return['connection'] = false;
    		$return['problem'] = "connection";
    	
    	}
    	
    	$this->ftp->close();
    	
    	return $return;
    
    }
    
    
    public function testLogin($server, $user, $pass, $port) {
    
    	$config['hostname'] = $server;
    	$config['username'] = $user;
    	$config['password'] = $pass;
    	$config['port'] = $port;
    	$config['debug'] = FALSE;
    	    	
    	if ( $this->ftp->connect($config) ) {
    	
    		$this->ftp->close();
    	
    		return $ftpConnection;
    	
    	} else {
    	
    		$this->ftp->close();
    	
    		return false;
    	
    	}
    
    }
    
    
    
    /*
    	
    	tests the path
    
    */
    
    public function testPath($server, $user, $pass, $port, $path) {
    
    	$config['hostname'] = $server;
    	$config['username'] = $user;
    	$config['password'] = $pass;
    	$config['port'] = $port;
    	$config['debug'] = FALSE;
    	    	
    	if ( $this->ftp->connect($config) ) {
    	
    		$list = $this->ftp->list_files( $path );
    		
    		if( $list ) {
    		
    			$this->ftp->close();
    			
    			return true;
    		
    		} else {
    		
    			$this->ftp->close();
    			
    			return false;
    		
    		}
    	
    	} else {
    	
    		$this->ftp->close();
    	
    		return false;
    	
    	}
    
    }
    
}