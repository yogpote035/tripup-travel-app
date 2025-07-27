import { useState } from "react";
import { format } from "date-fns";

const MUIDatePicker = ({  }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleChange = (newDate) => {
    setSelectedDate(newDate);

    const day = format(newDate, "EEE");
    onDayChange(day);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <DatePicker
          label="Date of Journey"
          value={selectedDate}
          onChange={handleChange}
          disablePast
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              variant="outlined"
              sx={{
                backgroundColor: "#1f2937", 
                input: { color: "white" },
                label: { color: "#9ca3af" }, 
                ".MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#4b5563", 
                  },
                  "&:hover fieldset": {
                    borderColor: "#60a5fa", 
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6", 
                  },
                },
              }}
            />
          )}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default MUIDatePicker;
