﻿window.getBoundingClientRect = function(element){
    const rect = element.getBoundingClientRect();
    return {
        left: rect.left,
        top: rect.top
    };
};