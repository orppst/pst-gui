package org.orph2020.pst.gui.routes;

import io.quarkus.vertx.web.RoutingExchange;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import jakarta.enterprise.context.ApplicationScoped;
import io.quarkus.vertx.web.Route;
import jakarta.enterprise.event.Observes;
import org.jboss.logging.Logger;


/*
 * Created on 18/03/2024 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

/**
 * Mess around with routing to have SPA at non-root path.
 * TODO - hopefully can be removed when https://github.com/quarkiverse/quarkus-quinoa/issues/302 is implemented.
 *
 */
@ApplicationScoped
public class Routing {

   private static final Logger log = Logger.getLogger(Routing.class);

   // put some routes before all the others to sort out the spa routing.
   void spa (@Observes Router router) {
      router.get("/").order(1).handler(rc ->{
         rc.reroute("/pst/gui/index.html");
      });
      router.get("/tool/*").order(2).handler(rc -> {
         final String path = rc.normalizedPath();
         log.debugf("SPA redirection "+ path);
         if(path.equals("/pst/gui/tool/index.html"))
            rc.next();
         else
            rc.reroute("/pst/gui/tool/index.html");
      });

      for (var r: router.getRoutes())
      {
         log.info(r.toString());
      }



   }


}
