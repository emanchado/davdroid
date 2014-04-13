/*jshint multistr:true*/
var RoboHydraHeadDAV = require("./headdav");
var RoboHydraHeadFilesystem =
        require("robohydra").heads.RoboHydraHeadFilesystem;

exports.getBodyParts = function(/*conf*/) {
    return {
        heads: [
            /* base URL */
            new RoboHydraHeadDAV({
                path: "/dav/",
                handler: function() { }
            }),

            /* address-book multiget */
            new RoboHydraHeadDAV({
                path: "/dav/addressbooks/default.vcf/",
                handler: function(req,res) {
                    if (req.method === "REPORT" && req.rawBody.toString().match(/addressbook-multiget[\s\S]+<prop>[\s\S]+<href>/m)) {
                        res.statusCode = 207;
                        res.write('<?xml version="1.0" encoding="utf-8" ?>\
                                  <multistatus xmlns="DAV:" xmlns:CARD="urn:ietf:params:xml:ns:carddav">\
                                  <response>\
                                  <href>/dav/addressbooks/default.vcf/1.vcf</href>\
                                  <propstat>\
                                  <prop>\
                                  <getetag/>\
                                  <CARD:address-data>BEGIN:VCARD\
                                  VERSION:3.0\
                                  NICKNAME:MULTIGET1\
                                  UID:1\
                                  END:VCARD\
                                  </CARD:address-data>\
                                  </prop>\
                                  <status>HTTP/1.1 200 OK</status>\
                                  </propstat>\
                                  </response>\
                                  <response>\
                                  <href>/dav/addressbooks/default.vcf/2.vcf</href>\
                                  <propstat>\
                                  <prop>\
                                  <getetag/>\
                                  <CARD:address-data>BEGIN:VCARD\
                                  VERSION:3.0\
                                  NICKNAME:MULTIGET2\
                                  UID:2\
                                  END:VCARD\
                                  </CARD:address-data>\
                                  </prop>\
                                  <status>HTTP/1.1 200 OK</status>\
                                  </propstat>\
                                  </response>\
                                  </multistatus>\
                                  ');
                    }
                }
            }),

            /* assets */
            new RoboHydraHeadFilesystem({
                mountPath: '/assets/',
                documentRoot: '../assets'
            })
        ]
    };
};
