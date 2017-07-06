<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_viewmode extends CI_Migration {
    
    public function up() {
                
        $fields = array(
            'viewmode' => array('type' => 'TEXT', 'default' => '', 'after' => 'sites_trashed', 'null' => false)
        );
        
        $this->dbforge->add_column('sites', $fields);
		
    }
    
    
    public function down() {
        
        $this->dbforge->drop_column('sites', 'viewmode');
        
    }
}