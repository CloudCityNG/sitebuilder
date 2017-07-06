<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Sites extends MY_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->library(array('ion_auth', 'form_validation'));
		$this->load->helper(array('url', 'form', 'string'));
		$this->load->model(array('sitemodel', 'usermodel', 'pagemodel', 'revisionmodel'));

		$this->data['pageTitle'] = $this->lang->line('sites_page_title');

		if (!$this->ion_auth->logged_in()) {
			redirect('/login');
		}
	}


	/**
	 * Lists all sites
	 */
	public function index()
	{
		//grab us some sites
		$this->data['sites'] = $this->sitemodel->all();

		//get all users
		$this->data['users'] = $this->usermodel->getAll();
		$this->data['page'] = "sites";
		$this->load->view('sites/sites', $this->data);
	}


	/**
	 * Load page builder
	 */
	public function create()
	{
		//create a  new, empty site
		$newSiteID = $this->sitemodel->createNew();
		redirect('sites/'.$newSiteID);
		//$this->data['builder'] = true;
		//$this->data['page'] = "newPage";
		//$this->load->view('sites/create', $this->data);
	}


	/**
	 * Saves page as a template for future use
	 * @return json
	 */
	public function tsave()
	{
		//do we have some frames to save?
		if ( !isset($_POST['pages']) && $_POST['pages'] != ''  ) {
			$temp = array();
			$temp['header'] = $this->lang->line('sites_save_error2_heading');
			$temp['content'] = $this->lang->line('sites_save_error2_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode($return) );
		}

        $templateID = $this->pagemodel->saveTemplate( $_POST['pages'], $_POST['fullPage'], $_POST['templateID'] );

		$return = array();

		if ( $templateID ) {//all good
			$temp = array();
			$temp['header'] = $this->lang->line('template_save_success1_heading');
			$temp['content'] = $this->lang->line('template_save_success1_message');

			$return['responseCode'] = 1;
			$return['templateID'] = $templateID;
			$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
		} else {//not good
			$temp = array();
			$temp['header'] = $this->lang->line('template_save_fail1_heading');
			$temp['content'] = $this->lang->line('template_save_fail1_message');

			$return['responseCode'] = 1;
			$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);
		}

		die( json_encode($return) );
	}


	/**
	 * Used to create new sites AND save existing ones
	 * @param  integer $forPublish [description]
	 * @return json
	 */
	public function save( $forPublish = 0 )
	{
        //do we have the required data?
		if ( !isset($_POST['siteData']) ) {
			$temp = array();
			$temp['header'] = $this->lang->line('sites_save_error1_heading');
			$temp['content'] = $this->lang->line('sites_save_error1_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode($return) );
		}

		//do we have some frames to save?
		if ( (!isset($_POST['pages']) || $_POST['pages'] == '') && ( !isset($_POST['toDelete']) )  ) {
			$temp = array();
			$temp['header'] = $this->lang->line('sites_save_error2_heading');
			$temp['content'] = $this->lang->line('sites_save_error2_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode($return) );
		}

		//should we save an existing site or create a new one?
        $this->sitemodel->update($_POST['siteData'], $_POST['pages']);

        //delete any pages?
        if ( isset($_POST['toDelete']) && is_array($_POST['toDelete']) && count($_POST['toDelete']) > 0 ) {
            foreach ( $_POST['toDelete'] as $page ) {
				$this->pagemodel->delete($_POST['siteData']['sites_id'], $page);
            }
        }

        $return = array();

        if ( $forPublish == 0 ) {//regular site save
            $temp = array();
            $temp['header'] = $this->lang->line('sites_save_success2_heading');
            $temp['content'] = $this->lang->line('sites_save_success2_message');
        } elseif ( $forPublish == 1 ) {//saving before publishing, requires different message
            $temp = array();
            $temp['header'] = $this->lang->line('sites_save_success3_heading');
            $temp['content'] = $this->lang->line('sites_save_success3_message');
        }

        $return['responseCode'] = 1;
        $return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);

        die( json_encode($return) );
	}


    /**
     * Loads some configuration data with ajax call
     * @return [type] [description]
     */
    public function siteData()
    {
        $return = $this->sitemodel->getSite($this->session->userdata('siteID'));

        // Delete unneeded stuff
        unset($return['assetFolders']);

        // Admin or no?
        if ( $this->ion_auth->is_admin() ) {
            $return['is_admin'] = 1;
        } else {
            $return['is_admin'] = 0;
        }

        echo json_encode($return);
    }


	/**
	 * Get and retrieve single site data
	 * @param  integer $siteID
	 * @return [type]         [description]
	 */
	public function site($siteID)
	{
		// Store the session ID with this session
		$this->session->set_userdata('siteID', $siteID);

		// If user is not an admin, we'll need to check of this site belongs to this user
		if ( !$this->ion_auth->is_admin() ) {
			if( !$this->sitemodel->isMine( $siteID ) ) {
				redirect('/sites');
			}
		}

		$siteData = $this->sitemodel->getSite($siteID);
		if ( $siteData == false ) {
			//site could not be loaded, redirect to /sites, with error message
			$this->session->set_flashdata('error', $this->lang->line('sites_site_error1'));
			redirect('/sites/', 'refresh');
		} else {
			$this->data['siteData'] = $siteData;

			//get page data
			$pagesData = $this->pagemodel->getPageData($siteID);
			if ( $pagesData ) {
				$this->data['pagesData'] = $pagesData;
			}

			//collect data for the image library
			$user = $this->ion_auth->user()->row();
			$userID = $user->id;
			$userImages = $this->usermodel->getUserImages( $userID );
			if ( $userImages ) {
				$this->data['userImages'] = $userImages;
			}
			$adminImages = $this->sitemodel->adminImages();
			if ( $adminImages ) {
				$this->data['adminImages'] = $adminImages;
			}

			//pre-build templates
			$pages = $this->pagemodel->getAllTemplates();

			//die( print_r($pages) );
			if ( $pages ) {
				$this->data['templates'] = $this->load->view('partials/templateframes', array('pages'=>$pages), true);
			}

			//grab all revisions
			$this->data['revisions'] = $this->revisionmodel->getForSite( $siteID, 'index' );
			$this->data['builder'] = true;
			$this->data['page'] = "site";
			$this->load->view('sites/create', $this->data);
		}
	}


	/**
	 * Get and retrieve single site data with ajax
	 * @param  string $siteID [description]
	 * @return [type]         [description]
	 */
	public function siteAjax($siteID = '')
	{
		if ( $siteID == '' || $siteID == 'undefined' ) { //siteID is missing
			$temp = array();
			$temp['header'] = $this->lang->line('sites_siteAjax_error1_heading');
			$temp['content'] = $this->lang->line('sites_siteAjax_error1_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode( $return ) );
		}

		$siteData = $this->sitemodel->getSite($siteID);
		if ( $siteData == false ) { //all did not go well
			$temp = array();
			$temp['header'] = $this->lang->line('sites_siteAjax_error2_heading');
			$temp['content'] = $this->lang->line('sites_siteAjax_error2_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			echo json_encode( $return );
		} else { //all went well
			$return = array();
			$return['responseCode'] = 1;
			$return['responseHTML'] = $this->load->view('partials/sitedata', array('data' => $siteData), true);

			echo json_encode( $return );
		}
	}


	/**
	 * Updates site details, submitting through ajax
	 * @return [type] [description]
	 */
	public function siteAjaxUpdate()
	{
		$this->form_validation->set_rules('siteID', 'Site ID', 'required');
		$this->form_validation->set_rules('siteSettings_siteName', 'Site name', 'required');

		if ($this->form_validation->run() == FALSE) { //all did not go well
			$temp = array();
			$temp['header'] = $this->lang->line('sites_siteAjaxUpdate_error1_heading');
			$temp['content'] = $this->lang->line('sites_siteAjaxUpdate_error1_message').validation_errors();

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			echo json_encode( $return );
		} else { //all good with the data, let's update
			$ftpOk = $this->sitemodel->updateSiteData( $_POST );
			$temp = array();
			$temp['header'] = $this->lang->line('sites_siteAjaxUpdate_success_heading');
			if ( $ftpOk ) {
				$temp['content'] = $this->lang->line('sites_siteAjaxUpdate_success_message1');
			} else {
				$temp['content'] = $this->lang->line('sites_siteAjaxUpdate_success_message2');
			}

			$return = array();
			$return['responseCode'] = 1;
			$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);

			if( $ftpOk ) {
				$return['ftpOk'] = 1;
			} else {
				$return['ftpOk'] = 0;
			}

			//we'll send back the updated site data as well
			$siteData = $this->sitemodel->getSite($_POST['siteID']);
			$return['responseHTML2'] = $this->load->view('partials/sitedata', array('data'=>$siteData), true);
			$return['siteName'] = $siteData['site']->sites_name;
			$return['siteID'] = $siteData['site']->sites_id;

			echo json_encode( $return );
		}
	}


	/**
	 * Gets the content of a saved frame and sends it back to the browser
	 * @param  [type] $frameID [description]
	 * @return [type]          [description]
	 */
	public function getframe($frameID)
	{
		$frame = $this->sitemodel->getSingleFrame($frameID);
		echo $frame->frames_content;
	}


	/**
	 * Publishes a site via FTP
	 * @param  string $type
	 */
	public function publish($type = 'page')
	{
		$this->load->helper('file');
        $this->load->helper('directory');
		//some error prevention first
		//siteID ok?
		$siteDetails = $this->sitemodel->getSite( $_POST['siteID'] );
		if ( $siteDetails == false ) {
			$temp = array();
			$temp['header'] = $this->lang->line('sites_publish_error1_heading');
			$temp['content'] = $this->lang->line('sites_publish_error1_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode( $return ) );
		}

		//do we have anythin to publish at all?
		if ( !isset( $_POST['item'] ) || $_POST['item'] == '' ) { //nothing to upload
			$temp = array();
			$temp['header'] = $this->lang->line('sites_publish_error2_heading');
			$temp['content'] = $this->lang->line('sites_publish_error2_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode( $return ) );
		}

		$theSite = $this->sitemodel->siteData($_POST['siteID']);

		// Establish FTP connection, needs error reporting
		$this->load->library('ftp');
		$config['hostname'] = $siteDetails['site']->ftp_server;
		$config['username'] = $siteDetails['site']->ftp_user;
		$config['password'] = $siteDetails['site']->ftp_password;
		$config['port'] = $siteDetails['site']->ftp_port;
		if ( !$this->ftp->connect($config) ) { //connection details are messed up
			$temp = array();
			$temp['header'] = $this->lang->line('sites_publish_error2_heading');
			$temp['content'] = $this->lang->line('sites_publish_error3_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode( $return ) );
		}

		// Uploading
		if ( $type == 'asset' ) {//asset publishing
			set_time_limit(0);//prevent timeout
            if ( $_POST['item'] == 'images' ) {
                //echo './elements/'.$_POST['item'].'/<br>';
                //create the /imaged folder?
                if ( !$this->ftp->list_files( $siteDetails['site']->ftp_path . "/images/" ) ) {
                    $this->ftp->mkdir( $siteDetails['site']->ftp_path . "/images/" );
                }
                $dirMap = directory_map( './elements/images/', 2 );
                foreach ( $dirMap as $key => $entry ) {
                    if ( is_array($entry) ) {
                        //folder, do all but take special care of /uploads
                        if ( $key != 'uploads/' ) {
                            $this->ftp->mirror('./elements/images/' . $key, $siteDetails['site']->ftp_path . "/images/" . $key);
                        } else {//take special care of the uploads folder
                            $user = $this->ion_auth->user()->row();
                            $userID = $user->id;

                            $uploadsMap = directory_map( './elements/images/uploads/', 1 );
                            foreach( $uploadsMap as $userIDFolder ) {
                                if( $userIDFolder == $userID . "/" ) {
                                    //echo $userIDFolder."\n";
                                    //create the /imaged folder?
                                    if( !$this->ftp->list_files( $siteDetails['site']->ftp_path . "/images/uploads/" ) ) {
                                        $this->ftp->mkdir( $siteDetails['site']->ftp_path . "/images/uploads/" );
                                    }
                                    $this->ftp->mirror('./elements/images/uploads/' . $userIDFolder, $siteDetails['site']->ftp_path . "/images/uploads/" . $userIDFolder);
                                }
                            }
                        }
                    } else {
                        //file
                        $sourceFile = '/elements/images/' . $entry;
                        $destinationFile = $siteDetails['site']->ftp_path . "/images/" . $entry;
                        //echo $sourceFile."\n";
                        //echo $_SERVER['DOCUMENT_ROOT'].$sourceFile."\n";
                        $this->ftp->upload('.' . $sourceFile, $destinationFile);
                    }
                }
            } else {
                $this->ftp->mirror('./elements/' . $_POST['item'] . '/', $siteDetails['site']->ftp_path . "/" . $_POST['item'] . "/");
            }
		} elseif ( $type == 'page' ) {//page publishing
			//create temp files
			//check to make sure the /tmp folder is writable
			if ( !is_writable('./tmp/') ) {
				$temp = array();
				$temp['header'] = $this->lang->line('sites_publish_error2_heading');
				$temp['content'] = $this->lang->line('sites_publish_error4_message');

				$return = array();
				$return['responseCode'] = 0;
				$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

				die( json_encode( $return ) );
			}
			//get page meta
			$meta = '';
			$pageMeta = $this->pagemodel->getSinglePage($_POST['siteID'], $_POST['item']);
			if ( $pageMeta ) {
				//insert title, meta keywords and meta description
				$meta .= '<title>' . $pageMeta->pages_title . '</title>' . "\r\n";
				$meta .= '<meta name="description" content="' . $pageMeta->pages_meta_description . '">' . "\r\n";
				$meta .= '<meta name="keywords" content="' . $pageMeta->pages_meta_keywords . '">';

                $pageContent = str_replace('<!--pageMeta-->', $meta, $_POST['pageContent']);

				//insert header includes;
				$includesPlusCss = '';
				if ( $pageMeta->pages_header_includes != '' ) {
					$includesPlusCss .= $pageMeta->pages_header_includes;
				}
				if ( $pageMeta->pages_css != '' ) {
					$includesPlusCss .= "\n<style>" . $pageMeta->pages_css . "</style>\n";
				}
				if ( $theSite->global_css != '' ) {
					$includesPlusCss .= "\n<style>" . $theSite->global_css . "</style>\n";
				}
				// Insert header includes
				$pageContent = str_replace("<!--headerIncludes-->", $includesPlusCss, $pageContent);
				// Remove frameCovers
				$pageContent = str_replace('<div class="frameCover" data-type="video"></div>', "", $pageContent);
			} else {
				$pageContent = $_POST['pageContent'];
			}
			if ( ! write_file('./tmp/' . $_POST['item'] . ".html", "<!-- DOCTYPE html -->" . $pageContent)) {
				//echo 'Unable to write the file';
			} else {
				//echo 'File written!';
			}
			//upload temp files
			set_time_limit(0);//prevent timeout
			$this->ftp->mirror('./tmp/', $siteDetails['site']->ftp_path . "/");
			//remove all temp fiels
			delete_files('./tmp/');
		}
		//all went well
        $this->sitemodel->published( $_POST['siteID'] );
		$return = array();
		$return['responseCode'] = 1;

		die( json_encode($return) );
	}


	/**
	 * Exports a site
	 */
	public function export()
	{
        $user = $this->ion_auth->user()->row();
        $userID = $user->id;

		$zip = new ZipArchive();
		$zip->open("./tmp/" . $this->config->item('export_fileName'), ZipArchive::CREATE);

		//add folder structure
		//prep path to assets array
		$temp = explode("|", './' . $this->config->item('export_pathToAssets'));
		foreach ( $temp as $thePath ) {
			// Create recursive directory iterator
			$files = new RecursiveIteratorIterator(
		    	new RecursiveDirectoryIterator( $thePath ),
		    	RecursiveIteratorIterator::LEAVES_ONLY
			);
			foreach ($files as $name => $file) {
				if ( $file->getFilename() != '.' && $file->getFilename() != '..' ) {
		    		// Get real path for current file
		    		$filePath = $file->getRealPath();
		    		$temp = explode("/", $name);
		    		array_shift( $temp );
		    		$newName = implode("/", $temp);
                    if ( $thePath == 'elements/images' ) {
                        //check if this is a user file
                        if ( strpos($file,'/uploads') !== false ) {
                            if( strpos($file,'/uploads/' . $userID . '/') !== false || $this->ion_auth->is_admin() ) {
                                // Add current file to archive
		    		            $zip->addFile($filePath, $newName);
                                //echo $filePath."<br>";
                            }
                        } else {
                            // Add current file to archive
		    		        $zip->addFile($filePath, $newName);
                            //echo $filePath."<br>";
                        }
                    } else {
		    		    // Add current file to archive
		    		    $zip->addFile($filePath, $newName);
                        //echo $filePath."<br>";
                    }
		    	}
			}
		}
        //die('');
		$theSite = $this->sitemodel->siteData($_POST['siteID']);
		foreach ( $_POST['pages'] as $page=>$content ) {
			//get page meta
			$pageMeta = $this->pagemodel->getSinglePage($_POST['siteID'], $page);
			if ( $pageMeta ) {
				//insert title, meta keywords and meta description
				$meta = '<title>' . $pageMeta->pages_title . '</title>' . "\r\n";
				$meta .= '<meta name="description" content="' . $pageMeta->pages_meta_description . '">' . "\r\n";
				$meta .= '<meta name="keywords" content="' . $pageMeta->pages_meta_keywords . '">';
				$pageContent = str_replace('<!--pageMeta-->', $meta, $content);

				//insert header includes;
				$includesPlusCss = '';
				if ( $pageMeta->pages_header_includes != '' ) {
					$includesPlusCss .= $pageMeta->pages_header_includes;
				}
				if ( $pageMeta->pages_css != '' ) {
					$includesPlusCss .= "\n<style>" . $pageMeta->pages_css . "</style>\n";
				}
				if( $theSite->global_css != '' ) {
					$includesPlusCss .= "\n<style>" . $theSite->global_css . "</style>\n";
				}
				// Insert header includes
				$pageContent = str_replace('<!--headerIncludes-->', $includesPlusCss, $pageContent);
				// Remove frameCovers
				$pageContent = str_replace('<div class="frameCover" data-type="video"></div>', "", $pageContent);
			} else {
				$pageContent = $content;
			}
			$zip->addFromString($page . ".html", $_POST['doctype'] . "\n" . stripslashes($pageContent));
			//echo $content;
		}
		//$zip->addFromString("testfilephp.txt" . time(), "#1 This is a test string added as testfilephp.txt.\n");
		//$zip->addFromString("testfilephp2.txt" . time(), "#2 This is a test string added as testfilephp2.txt.\n");
		$zip->close();
		$yourfile = $this->config->item('export_fileName');
		$file_name = basename($yourfile);

		header("Content-Type: application/zip");
		header("Content-Transfer-Encoding: Binary");
		header("Content-Disposition: attachment; filename=$file_name");
		header("Content-Length: " . filesize("./tmp/".$yourfile));

		readfile("./tmp/".$yourfile);

		unlink('./tmp/'.$yourfile);

		exit;
	}


	/**
	 * Moves a single site to the trash bin
	 * @param  string $siteID
	 * @return json
	 */
	public function trash($siteID = '')
	{
		if ( $siteID == '' || $siteID == 'undefined' ) {
			$temp = array();
			$temp['header'] = $this->lang->line('sites_trash_error1_heading');
			$temp['content'] = $this->lang->line('sites_trash_error1_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode( $return ) );
		}

		//all good, move to trash
		$this->sitemodel->trash( $siteID );

		$temp = array();
		$temp['header'] = $this->lang->line('sites_trash_success_heading');
		$temp['content'] = $this->lang->line('sites_trash_success_message');

		$return = array();
		$return['responseCode'] = 1;
		$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);

		die( json_encode( $return ) );
	}


	/**
	 * Updates page meta data with ajax call
	 * @return json
	 */
	public function updatePageData()
	{
		if ( $_POST['siteID'] == '' || $_POST['siteID'] == 'undefined' || !isset( $_POST ) ) {
			$temp = array();
			$temp['header'] = $this->lang->line('sites_updatePageData_error1_heading');
			$temp['content'] = $this->lang->line('sites_updatePageData_error1_message');

			$return = array();
			$return['responseCode'] = 0;
			$return['responseHTML'] = $this->load->view('partials/error', array('data'=>$temp), true);

			die( json_encode( $return ) );
		}

		// Update page data
		$this->pagemodel->updatePageData( $_POST );

		// Return page data as well
		$return = array();
		$pagesData = $this->pagemodel->getPageData($_POST['siteID']);
		if ( $pagesData ) {
			$return['pagesData'] = $pagesData;
		}

		$temp = array();
		$temp['header'] = $this->lang->line('sites_updatePageData_success_heading');
		$temp['content'] = $this->lang->line('sites_updatePageData_success_message');

		$return['responseCode'] = 1;
		$return['responseHTML'] = $this->load->view('partials/success', array('data'=>$temp), true);

		die( json_encode( $return ) );
	}

	/**
	 * function generates a live preview of current changes
	 */
	public function livepreview()
	{
		if ( isset($_POST['siteID']) && $_POST['siteID'] != '' ) {
			$siteData = $this->sitemodel->siteData( $_POST['siteID'] );
		}

		$meta = '';
		// Page title
		if ( isset($_POST['meta_title']) && $_POST['meta_title'] != '' ) {
			$meta .= '<title>' . $_POST['meta_title'] . '</title>' . "\n";
		}
		// Page meta description
		if ( isset($_POST['meta_description']) && $_POST['meta_description'] != '' ) {
			$meta .= '<meta name="description" content="' . $_POST['meta_description'] . '"/>' . "\n";
		}
		// Page meta keywords
		if ( isset($_POST['meta_keywords']) && $_POST['meta_keywords'] != '' ) {
			$meta .= '<meta name="keywords" content="' . $_POST['meta_keywords'] . '"/>' . "\n";
		}
		// Replace meta value
		$content = str_replace('<!--pageMeta-->', $meta, "<!DOCTYPE html>\n" . $_POST['page']);

		$head = '';
		// Page header includes
		if ( isset($_POST['header_includes']) && $_POST['header_includes'] != '' ) {
			$head .= $_POST['header_includes'] . "\n";
		}
		// Page css
		if ( isset($_POST['page_css']) && $_POST['page_css'] != '' ) {
			$head .= "\n<style>" . $_POST['page_css'] . "</style>\n";
		}
		// Global css
		if( $siteData->global_css != '' ) {
			$head .= "\n<style>" . $siteData->global_css . "</style>\n";
		}

        // Custom header to deal with XSS protection
        header("X-XSS-Protection: 0");
		echo str_replace('<!--headerIncludes-->', $head, $content);
	}


	/**
	 * Delete template
	 * @param  integer $siteID
	 * @param  integer $pageID
	 */
	public function deltempl($siteID, $pageID)
	{
		if ( !$this->ion_auth->is_admin() ) {
			die('You are not allowed to do this.');
		}
		$this->pagemodel->deleteTemplate($siteID, $pageID);
		$return = array();
		$this->session->set_flashdata('success', "The page template was successfully deleted.");

		redirect('/sites/'.$siteID, 'refresh');
	}


	/**
	 * Attempts to retrieve a preview for a revision
	 * @param  string $siteID
	 * @param  string $revisionStamp
	 */
	public function rpreview( $siteID = '', $revisionStamp = '')
	{
		if( $siteID == '' || $revisionStamp == '' || $_GET['p'] == '' ) {
			die('Missing data, revision could not be loaded');
		}
		$page = $_GET['p'];
		$revisionOutput = $this->revisionmodel->buildRevision($siteID, $revisionStamp, $page);

		echo $revisionOutput;
	}


	/**
	 * Updates revisions for a certain page with ajax call
	 * @param  string $siteID
	 * @param  string $page
	 */
	public function getRevisions($siteID = '', $page = '')
	{
		if( $siteID != '' && $page != '' ) {
			$revisions = $this->revisionmodel->getForSite( $siteID, $page );
			$this->load->view('partials/revisions', array('revisions'=>$revisions, 'page'=>$page, 'siteID'=>$siteID));
		}
	}


	/**
	 * Deletes a revision with ajax call
	 * @param  string $siteID
	 * @param  string $timestamp
	 * @param  string $page
	 * @return json
	 */
	public function deleterevision($siteID = '', $timestamp = '', $page = '')
	{
		$return = array();
		if( $siteID == '' || $timestamp == '' || $page == '' ) {
			$return['code'] = 0;
			$return['message'] = "Some data is missing, we can not delete this revision right now. Please try again later.";
			die( json_encode($return) );
		}
		$this->revisionmodel->delete($siteID, $timestamp, $page);
		$return['code'] = 1;
		$return['message'] = "The revision was removed successfully.";

		echo json_encode( $return );
	}


	/**
	 * Restores a revision for a specific page
	 * @param  string $siteID
	 * @param  string $timestamp
	 * @param  string $page
	 */
	public function restorerevision($siteID = '', $timestamp = '', $page = '')
	{
		if( $siteID == '' || $timestamp == '' || $page == '' ) {
			die('Error, data missing');
		}
		$this->revisionmodel->restore($siteID, $timestamp, $page);

		//redirect
		redirect('sites/'.$siteID."?p=".$page, 'location');
	}

}

/* End of file sites.php */
/* Location: ./application/controllers/sites.php */