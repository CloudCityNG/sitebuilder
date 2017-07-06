<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Revisionmodel extends CI_Model {

    function __construct()
    {
        parent::__construct();
        
        $this->load->database();
		$this->load->library('simple_html_dom');
        
    }
    
    
    /*
		get revisions for a site
	*/
	
	public function getForSite( $siteID, $page = 'index' ) {
		
		//retrieve page ID first
		$q = $this->db->from('pages')->where('sites_id', $siteID)->where('pages_name', $page)->get();
		
		if( $q->num_rows() > 0 ) {
			
			$res = $q->result();
			
			$pageID = $res[0]->pages_id;
		
			$q = $this->db->from('frames')->distinct()->select('frames_timestamp')->where('sites_id', $siteID)->where('revision', 1)->where('pages_id', $pageID)->order_by('frames_timestamp', 'DESC')->get();
			
			//die( $this->db->last_query() );
			
			if( $q->num_rows() > 0 ) {
			
				return $q->result();
			
			} else {
			
				return false;
			
			}
			
		} else {
			
			return false;
			
		}
				
	}
	
	
	/* 
		generates a revision for previewing
	 */
	
	public function buildRevision($siteID, $timestamp, $page) {
		
		
		//retrieve the page ID first
		
		$q = $this->db->from('pages')->where('sites_id', $siteID)->where('pages_name', $page)->get();
		
		if( $q->num_rows() > 0 ) {
			
			$res = $q->result();
			
			$pageID = $res[0]->pages_id;
			
			$q = $this->db->from('frames')->where('sites_id', $siteID)->where('frames_timestamp', $timestamp)->where('revision', 1)->where('pages_id', $pageID)->get();
			
			if( $q->num_rows() > 0 ) {
				
				$res = $q->result();
		
				$skeleton = file_get_html('./elements/skeleton.html');
			
				//get the page container
				$ret = $skeleton->find('div[id=page]', 0);
			
				$page = '';
			
				foreach( $res as $frame ) {
					
					$frameHTML = str_get_html( $frame->frames_content );
					
					$frameContent = $frameHTML->find('div[id=page]', 0);
					
					$page .= $frameContent->innertext;
					
				}
				
				$ret->innertext = $page;
			
				// Print it!
				return $skeleton; 
			
			} else {
				
				return false;
				
			} 
						
		} else {
			
			return false;
			
		}
				
	}
	
	
	
	/* 
		deletes a page revision
	*/
	
	public function delete($siteID, $timestamp, $page) {
		
		//retrieve the page ID first
		
		$q = $this->db->from('pages')->where('sites_id', $siteID)->where('pages_name', $page)->get();
		
		if( $q->num_rows() > 0 ) {
		
			$res = $q->result();
			
			$pageID = $res[0]->pages_id;
			
			//delete the revision
			
			$this->db->where('sites_id', $siteID);
			$this->db->where('frames_timestamp', $timestamp);
			$this->db->where('pages_id', $pageID);
			$this->db->delete('frames');
			
		}
		
	}
	
	
	/*
		restores a revision
	*/
	
	public function restore($siteID, $timestamp, $page) {
		
		//retrieve the page ID first
		
		$q = $this->db->from('pages')->where('sites_id', $siteID)->where('pages_name', $page)->get();
		
		if( $q->num_rows() > 0 ) {
			
			$res = $q->result();
			
			$pageID = $res[0]->pages_id;
			
			
			//push current frames into a revision
			
			$data = array(
				'revision' => 1
			);
			
			$this->db->where('sites_id', $siteID);
			$this->db->where('pages_id', $pageID);
			$this->db->where('revision', 0);
			$this->db->update('frames', $data);
			
							
			//restore revision by recreating the old revision
			
			//select first
			
			$q = $this->db->from('frames')->where('frames_timestamp', $timestamp)->where('sites_id', $siteID)->where('pages_id', $pageID)->get();
			
			if( $q->num_rows() > 0 ) {
				
				//copy frames
				
				foreach( $q->result() as $frame ) {
					
					$data = array(
						'sites_id' => $siteID,
						'pages_id' => $pageID,
						'frames_content' => $frame->frames_content,
						'frames_height' => $frame->frames_height,
						'frames_original_url' => $frame->frames_original_url,
						'frames_loaderfunction' => $frame->frames_loaderfunction,
						'frames_sandbox' => $frame->frames_sandbox,
						'frames_timestamp' => time(),
						'revision' => 0
					);
					
					$this->db->insert('frames', $data);
					
				}
				
			}
						
		}
		
	}
    
}