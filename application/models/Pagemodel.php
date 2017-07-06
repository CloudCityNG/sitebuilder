<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Pagemodel extends CI_Model {

    function __construct()
    {
        parent::__construct();
        
        $this->load->database();
        $this->load->library('session');
        $this->load->library('ion_auth');
        
    }
    
    
    /*
    
    	get page meta data for an entire site
    
    */
    
    public function getPageData($siteID) {
    
    	$query = $this->db->from('pages')->where('sites_id', $siteID)->get();
    	    	
    	if( $query->num_rows() > 0 ) {
    	
    		$res = $query->result();
    		
    		$return = array();
    		
    		foreach( $res as $page ) {
                
                //include all frames for this page
                $query = $this->db->from('frames')->where('pages_id', $page->pages_id)->where('revision', 0)->get();
                
                if( $query->num_rows() > 0 ) {
                    $page->frames = $query->result();  
                } else {
                    $page->frames = null;   
                }
    		
    			$return[$page->pages_name] = $page;
    		
    		}
    		    		
    		return $return;
    	
    	} else {
    	
    		return false;
    	
    	}
    
    }
    
    
    
    /*
    
    	retrieves meta data for single page, using the siteID and page name
    
    */
    
    public function getSinglePage($siteID, $pageName) {
    
    	$query = $this->db->from('pages')->where('sites_id', $siteID)->where('pages_name', $pageName)->get();
		    
    	if( $query->num_rows() > 0 ) {
    	
    		$res = $query->result();
    	
    		return $res[0];
    	
    	} else {//no match found
    	
    		return false;
    	
    	}
    
    }
    
    
    
    
    /*
    
    	updates page meta data
    
    */
    
    public function updatePageData( $pageData ) {
    
    	//do we have a pageID?
    	
    	if( $pageData['pageID'] != '' ) {
    
    		$data = array(
				'pages_title' => $pageData['pageData_title'],
				'pages_meta_keywords' => $pageData['pageData_metaKeywords'],
				'pages_meta_description' => $pageData['pageData_metaDescription'],
				'pages_header_includes' => $pageData['pageData_headerIncludes'],
				'pages_css' => $pageData['pageData_headerCss']
   			);
    	
    		$this->db->where('pages_id', $pageData['pageID']);
    		$this->db->update('pages', $data);
    	
    	} else {
    	
    		//no pageID given, create a new page in the db
    		$data = array(
    		   'sites_id' => $pageData['siteID'],
    		   'pages_name' => $pageData['pageName'],
    		   'pages_timestamp' => time(),
    		   'pages_title' => $pageData['pageData_title'],
    		   'pages_meta_keywords' => $pageData['pageData_metaKeywords'],
    		   'pages_meta_description' => $pageData['pageData_metaDescription'],
    		   'pages_header_includes' => $pageData['pageData_headerIncludes'],
			   'pages_css' => $pageData['pageData_headerCss']
    		);
    		
    		$this->db->insert('pages', $data); 
    	
    	}
    
    }
	
	
	
	/*
		deletes a single page
	*/
	
	public function delete($siteID, $page) {
		
		$query = $this->db->from('pages')->where('sites_id', $siteID)->where('pages_name', $page)->get();
				
		if( $query->num_rows() > 0 ) {
			
			$res = $query->result();
			
			$page = $res[0];
			
			//remove frames
			$this->db->where('pages_id', $page->pages_id);
			$this->db->delete('frames');
			
			//delete page
			$this->db->where('pages_id', $page->pages_id);
			$this->db->delete('pages');
			
		}
		
	}
	
	
	
	/* 
	
		creates a new page template or saves existing one
	
	*/
	
	public function saveTemplate( $siteData, $contents = '', $templateID = 0 ) {
			
		reset( $siteData );
		$pageName = key( $siteData );
		
		if( $templateID == 0 ) {//cerate new template
		
			$pagePreview = ( $contents != '' )? $contents : '';
		
			$data = array(
				'pages_name' => $pageName,
				'pages_timestamp' => time(),
				'pages_preview' => $pagePreview,
				'pages_template' => 1,
                'pages_title' => $siteData[$pageName]['pageSettings']['title'],
                'pages_meta_keywords' => $siteData[$pageName]['pageSettings']['meta_keywords'],
                'pages_meta_description' => $siteData[$pageName]['pageSettings']['meta_description'],
                'pages_header_includes' => $siteData[$pageName]['pageSettings']['header_includes'],
                'pages_css' => $siteData[$pageName]['pageSettings']['page_css']
			);
				
		
			$this->db->insert('pages', $data); 
		
			if( $this->db->affected_rows() == 1 ) {
			
				$pageID = $this->db->insert_id();
			
				$frames = $siteData[$pageName]['blocks'];
			
    			//page is done, now all the frames for this page
    		
    			if( is_array( $frames ) ) {
    		
    				foreach( $frames as $frameData ) {
    		
    					$data = array(
    						'pages_id' => $pageID,
    						'frames_content' => $frameData['frameContent'],
    						'frames_height' => $frameData['frameHeight'],
    						'frames_original_url' => $frameData['originalUrl'],
							'frames_sandbox' => ($frameData['sandbox'])? 1: 0,
							'frames_loaderfunction' => $frameData['loaderFunction'],
    						'frames_timestamp' => time()
    					);
    			
    					$this->db->insert('frames', $data); 
    		
    				}
    		
    			}
			
			
			} else {
			
				$pageID = false;
			
			}
				
			return $pageID;
		
		} else {//update existing template
		
			$pagePreview = ( $contents != '' )? $contents : '';
			
			$data = array(
				'pages_name' => $pageName,
				'pages_timestamp' => time(),
				'pages_preview' => $pagePreview,
				'pages_template' => 1,
                'pages_title' => $siteData[$pageName]['pageSettings']['title'],
                'pages_meta_keywords' => $siteData[$pageName]['pageSettings']['meta_keywords'],
                'pages_meta_description' => $siteData[$pageName]['pageSettings']['meta_description'],
                'pages_header_includes' => $siteData[$pageName]['pageSettings']['header_includes'],
                'pages_css' => $siteData[$pageName]['pageSettings']['page_css']
			);
			
			$this->db->where('pages_id', $templateID);
			$this->db->update('pages', $data); 
			
			//delete old frames
			$this->db->where('pages_id', $templateID);
			$this->db->delete('frames');
			
			//insert new frames
			$frames = $siteData[$pageName]['blocks'];
				
			if( is_array( $frames ) ) {
		
				foreach( $frames as $frameData ) {
				
					$data = array(
						'pages_id' => $templateID,
                        'frames_content' => $frameData['frameContent'],
						'frames_height' => $frameData['frameHeight'],
						'frames_original_url' => $frameData['originalUrl'],
						'frames_sandbox' => ($frameData['sandbox'] == 'true')? 1: 0,
						'frames_loaderfunction' => $frameData['loaderFunction'],
						'frames_timestamp' => time()
					);
			
					$this->db->insert('frames', $data);
					
					//echo $this->db->last_query()."<br>"; 
		
				}
		
			}
						
			return $templateID;
			
		}
				
	}
	
	
	
	/*
		
		get all templates
	
	*/
	
	public function getAllTemplates() {
		
		$templates = array();
		
		$q = $this->db->from('pages')->where('pages_template', '1')->get();
		
		if( $q->num_rows() > 0 ) {
		
			$pages = $q->result();
		
    		//now we need all frames for each page
    
    		foreach( $pages as $page ) {
    
    			$pageFrames = array();
    	
    			$q = $this->db->from('frames')->where('pages_id', $page->pages_id)->where('revision', 0)->get();
    	
    			foreach( $q->result() as $f ) {
	    	
	    			$frame = array();
	    		
					$frame['pageName'] = $page->pages_name;
					$frame['pageID'] = $page->pages_id;
	    			$frame['id'] = $f->frames_id;
	    			$frame['height'] = $f->frames_height;
	    			$frame['original_url'] = $f->frames_original_url;
	    	
	    			$pageFrames[] = $frame;
	    	
	    		}
    	
	    		$templates[ $page->pages_id ] = $pageFrames;
    
			}
		
			return $templates;
		
		} else {
			
			return false;
			
		}
		
	}
	
	
	/*
	
		Delete page template
	
	*/
	
	public function deleteTemplate($siteID, $pageID) {
		
		//start by deleting the frames
		$this->db->where('pages_id', $pageID);
		$this->db->delete('frames'); 
				
		//delete the page itself
		$this->db->where('pages_id', $pageID);
		$this->db->delete('pages'); 
		
	}
	
	
	
    /*
	    
	    grabs all the blocks on this page, mixes them into a single HTML document and return the result
	    
    */
    
    public function loadPage($pageID) {
	    
	    $this->load->library('simple_html_dom');
	    
	    
	    //grab the frames
	    
	    $q = $this->db->from('frames')->where('pages_id', $pageID)->get();
	    	    
	    if( $q->num_rows() > 0 ) {
	    	
	    	
	    	//get the skeleton
	    	$theSkeleton = file_get_html('./elements/skeleton.html');
	    
		    
		    foreach( $q->result() as $frame ) {
			    
			    $html = str_get_html($frame->frames_content);
			    
			    $block = $html->find('div[id=page]', 0)->innertext;
			    
			    
			    $theSkeleton->find('div[id=page]', 0)->innertext .= $block;
			    			    
			    
		    }
		    
		    $str = $theSkeleton;
		    
		    echo $str;
		    
	    }
	    
    }
    
}