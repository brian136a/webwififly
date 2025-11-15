<?php

/**
 * Gets the IP address of the client using a proxy if any
 * @return string
 */
function getClientIp(){
    $TRUSTED_PROXIES=['127.0.0.1','::1'];
    $ip=$_SERVER['REMOTE_ADDR'];
    if(array_key_exists('HTTP_CF_CONNECTING_IP',$_SERVER)){
        $ip=$_SERVER['HTTP_CF_CONNECTING_IP'];
    }elseif(array_key_exists('HTTP_X_FORWARDED_FOR',$_SERVER)){
        $ip=explode(',',$_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }elseif(array_key_exists('HTTP_X_FORWARDED',$_SERVER)){
        $ip=explode(',',$_SERVER['HTTP_X_FORWARDED'])[0];
    }elseif(array_key_exists('HTTP_FORWARDED_FOR',$_SERVER)){
        $ip=explode(',',$_SERVER['HTTP_FORWARDED_FOR'])[0];
    }elseif(array_key_exists('HTTP_FORWARDED',$_SERVER)){
        $ip=explode(',',$_SERVER['HTTP_FORWARDED'])[0];
    }
    $ip=str_replace(' ','',$ip);
    $ip=str_replace('::ffff:','',$ip);
    return $ip;
}

