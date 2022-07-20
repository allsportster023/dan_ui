import { createTheme } from "@mui/material/styles";

const baseTheme = createTheme({
  // palette: {
  //   primary: {
  //     main: "#ffffff",
  //   },
  //   secondary: {
  //     main: "#9500ae",
  //   },
  //   warning: {
  //     main: "#d14747",
  //   },
  // },

  components: {

    MuiSelect: {
      defaultProps: {},
      styleOverrides: {
        select: {
          paddingTop: 0,
        },
        root: {
          paddingTop: 0
          
        },
        icon: {
            paddingBottom: 4
        },
        standard: {
          paddingBottom: 0
        }

      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          paddingBottom: 8,
          top: 0
        }
      }
    }
  },
});

export default baseTheme;
