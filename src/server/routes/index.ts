import climateRoutes from "./api/climate";
import usageRoutes from "./api/usages";
import staticRoutes from "./static";

export default () => ({
  ...staticRoutes,
  ...climateRoutes,
  ...usageRoutes,
});
