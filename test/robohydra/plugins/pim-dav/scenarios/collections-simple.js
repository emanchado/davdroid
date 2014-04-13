/*jshint multistr:true*/
var RoboHydraHeadDAV = require("../headdav");

exports.getBodyParts = function(/*conf*/) {
    return {
        heads: [
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
            })
        ]
    };
};

