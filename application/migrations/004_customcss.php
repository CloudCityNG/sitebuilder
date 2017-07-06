<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Customcss extends CI_Migration {
    
    public function up() {
                
        $fields = array(
            'pages_css' => array('type' => 'TEXT', 'default' => '', 'after' => 'pages_template')
        );
        
        $this->dbforge->add_column('pages', $fields);
		
		$fields = array(
            'global_css' => array('type' => 'TEXT', 'default' => '', 'after' => 'publish_date')
        );
        
        $this->dbforge->add_column('sites', $fields);
		
    }
    
    
    public function down() {
        
        $this->dbforge->drop_column('pages', 'pages_css');
		$this->dbforge->drop_column('sites', 'global_css');
        
    }
}