/*jshint multistr:true*/
var RoboHydraHeadDAV = require("./headdav");
var RoboHydraHeadFilesystem =
        require("robohydra").heads.RoboHydraHeadFilesystem;
var xml = require("xml");

exports.getBodyParts = function(/*conf*/) {
    return {
        heads: [
            /* base URL */
            new RoboHydraHeadDAV({
                path: "/dav/",
                handler: function() { }
            }),

            /* principal URL */
            new RoboHydraHeadDAV({
                path: "/dav/principals/users/test",
                handler: function(req,res) {
                    if (req.method === "PROPFIND" && req.rawBody.toString().match(/home-set/)) {
                        res.statusCode = 207;
                        res.write(xml({
                            multistatus: [
                                {_attr: {xmlns: "DAV:"}},
                                {response: [
                                    {href: req.url},
                                    {propstat: [
                                        {prop: [
                                            {"CARD:addressbook-home-set": [
                                                {_attr: {"xmlns:CARD": "urn:ietf:params:xml:ns:carddav"}},
                                                {href: "/dav/addressbooks/test"}
                                            ]},
                                            {"CAL:calendar-home-set": [
                                                {_attr: {"xmlns:CAL": "urn:ietf:params:xml:ns:caldav"}},
                                                {href: "/dav/calendars/test/"}
                                            ]}
                                        ]},
                                        {status: "HTTP/1.1 200 OK"}
                                    ]}
                                ]}
                            ]},
                            {declaration: true,
                             indent: '  '}));
                    }
                }
            }),

            /* address-book home set */
            new RoboHydraHeadDAV({
                path: "/dav/addressbooks/test/",
                handler: function(req,res) {
                    if (!req.url.match(/\/$/)) {
                        res.statusCode = 302;
                        res.headers.location = "/dav/addressbooks/test/";
                    }
                    else if (req.method === "PROPFIND" && req.rawBody.toString().match(/addressbook-description/)) {
                        res.statusCode = 207;
                        res.write('<?xml version="1.0" encoding="utf-8" ?>\
                                  <multistatus xmlns="DAV:">\
                                  <response>\
                                  <href>/dav/addressbooks/test/useless-member</href>\
                                  <propstat>\
                                  <prop>\
                                  <resourcetype/>\
                                  </prop>\
                                  <status>HTTP/1.1 200 OK</status>\
                                  </propstat>\
                                  </response>\
                                  <response>\
                                  <href>/dav/addressbooks/test/default.vcf/</href>\
                                  <propstat>\
                                  <prop xmlns:CARD="urn:ietf:params:xml:ns:carddav">\
                                  <resourcetype>\
                                  <collection/>\
                                  <CARD:addressbook/>\
                                  </resourcetype>\
                                  <CARD:addressbook-description>\
                                 Default Address Book\
                                  </CARD:addressbook-description>\
                                  </prop>\
                                  <status>HTTP/1.1 200 OK</status>\
                                  </propstat>\
                                  </response>\
                                  </multistatus>\
                                  ');
                    }
                }
            }),

            /* calendar home set */
            new RoboHydraHeadDAV({
                path: "/dav/calendars/test/",
                handler: function(req,res) {
                    if (req.method === "PROPFIND" && req.rawBody.toString().match(/addressbook-description/)) {
                        res.statusCode = 207;
                        res.write('<?xml version="1.0" encoding="utf-8" ?>\
                                  <multistatus xmlns="DAV:" xmlns:CAL="urn:ietf:params:xml:ns:caldav">\
                                  <response>\
                                  <href>/dav/calendars/test/shared.forbidden</href>\
                                  <propstat>\
                                  <prop>\
                                  <resourcetype/>\
                                  </prop>\
                                  <status>HTTP/1.1 403 Forbidden</status>\
                                  </propstat>\
                                  </response>\
                                  <response>\
                                  <href>/dav/calendars/test/private.ics</href>\
                                  <propstat>\
                                  <prop>\
                                  <resourcetype>\
                                  <collection/>\
                                  <CAL:calendar/>\
                                  </resourcetype>\
                                  </prop>\
                                  <status>HTTP/1.1 200 OK</status>\
                                  </propstat>\
                                  </response>\
                                  <response>\
                                  <href>/dav/calendars/test/work.ics</href>\
                                  <propstat>\
                                  <prop>\
                                  <resourcetype>\
                                  <collection/>\
                                  <CAL:calendar/>\
                                  </resourcetype>\
                                  <A:calendar-color xmlns:A="http://apple.com/ns/ical/">0xFF00FF</A:calendar-color>\
                                  </prop>\
                                  <status>HTTP/1.1 200 OK</status>\
                                  </propstat>\
                                  </response>\
                                  </multistatus>\
                                  ');
                    }
                }
            }),

            /* non-existing file */
            new RoboHydraHeadDAV({
                path: "/dav/collection/new.file",
                handler: function(req,res) {
                    if (req.method === "PUT") {
                        if (req.headers['if-match']) { /* can't overwrite new file */
                            res.statusCode = 412;
                        } else {
                            res.statusCode = 201;
                        }
                    } else if (req.method === "DELETE") {
                        res.statusCode = 404;
                    }
                }
            }),

            /* existing file */
            new RoboHydraHeadDAV({
                path: "/dav/collection/existing.file",
                handler: function(req,res) {
                    if (req.method === "PUT") {
                        if (req.headers['if-none-match']) { /* requested "don't overwrite", but this file exists */
                            res.statusCode = 412;
                        } else {
                            res.statusCode = 204;
                        }
                    } else if (req.method === "DELETE") {
                        res.statusCode = 204;
                    }
                }
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
