<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Publishdate extends CI_Migration {
    
    public function up() {
                
        $fields = array(
            'publish_date' => array('type' => 'INT', 'constraint' => 11, 'default' => '0', 'after' => 'ftp_published')
        );
        
        $this->dbforge->add_column('sites', $fields);
    }
    
    
    public function down() {
        
        $this->dbforge->drop_column('sites', 'publish_date');
        
    }
}