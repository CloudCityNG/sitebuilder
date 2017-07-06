<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_globalblocks extends CI_Migration {
    
    public function up() {
                
        $fields = array(
            'frames_global' => array('type' => 'INT', 'constraint' => 1, 'default' => '0', 'after' => 'frames_timestamp', 'null' => false)
        );
        
        $this->dbforge->add_column('frames', $fields);
		
    }
    
    
    public function down() {
        
        $this->dbforge->drop_column('frames', 'frames_global');
        
    }
}