<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Revisions extends CI_Migration {
    
    public function up() {
                
        $fields = array(
            'revision' => array('type' => 'INT', 'constraint' => 1, 'default' => '0', 'after' => 'frames_timestamp')
        );
        
        $this->dbforge->add_column('frames', $fields);
    }
    
    
    public function down() {
        
        $this->dbforge->drop_column('frames', 'revision');
        
    }
}