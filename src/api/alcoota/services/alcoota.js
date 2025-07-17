'use strict';

/**
 * alcoota service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::alcoota.alcoota');
