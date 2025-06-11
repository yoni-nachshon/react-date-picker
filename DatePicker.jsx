const { useState, useEffect, useRef } = React;

export const DatePicker = ({
  initialDate,
  onDateSelect,
  presetValues = [7, 14, 30, 45, null],
  showPresetSelect = true,
  style = {},
  disabled = false
}) => {
  initialDate = initialDate ? new Date(initialDate) : null;
  const [selectedDate, setSelectedDate] = useState(initialDate || null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [inputValue, setInputValue] = useState(
    initialDate ? formatDate(initialDate) : ""
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const datePickerRef = useRef(null);
  const presetDropdownRef = useRef(null);
  const calendarContainerRef = useRef(null);

  useEffect(() => {
    if (showCalendar && calendarContainerRef.current) {
      // Find the position of the options container
      const rect = calendarContainerRef.current.getBoundingClientRect();

      // Find the modal content (the scrollable container)
      const modalContent = document.querySelector(".ui-modal-content");


      // Get visible area height
      const containerHeight = modalContent
        ? modalContent.clientHeight
        : window.innerHeight;

      // Check if the options container is below the visible area
      const isBelow = rect.bottom > containerHeight;

      if (isBelow) {
        if (modalContent) {
          const offsetTop = rect.top - modalContent.getBoundingClientRect().top;
          modalContent.scrollTo({
            top: offsetTop - 150, // Scroll to position with some extra space
            behavior: "smooth",
          });
        } else {
          // Otherwise scroll the window
          window.scrollTo({
            top: window.pageYOffset + rect.top - 100,
            behavior: "smooth",
          });
        }

        // Optionally, ensure the container itself is visible
        setTimeout(() => {
          if (calendarContainerRef.current) {
            calendarContainerRef.current.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 100);
      }
    }
  }, [showCalendar]);

  const daysOfWeek = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const months = [
    "ינו",
    "פבר",
    "מרץ",
    "אפר",
    "מאי",
    "יונ",
    "יול",
    "אוג",
    "ספט",
    "אוק",
    "נוב",
    "דצמ",
  ];

  const [displayText, setDisplayText] = useState(
    initialDate ? formatDisplayText(initialDate) : ""
  );
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    initialDate ? initialDate.getMonth() : today.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    initialDate ? initialDate.getFullYear() : today.getFullYear()
  );
  const [startYear, setStartYear] = useState(today.getFullYear() - 5);

  const [selectedPreset, setSelectedPreset] = useState("");
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  const titleMap = {
    7: "שבוע",
    14: "שבועיים",
    30: "חודש",
    60: "חודשיים",
    180: "חצי שנה",
    365: "שנה",
  };
  function formatDisplayText(date) {
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
  const generatePresetDates = (values) => {
    return values?.map((value) => {
      if (value === null) {
        return { label: "ללא", value: null };
      } else {
        const label = titleMap[value] || `${value} יום`;
        return { label, value };
      }
    });
  };

  const presetDates = generatePresetDates(presetValues);

  const handlePresetOptionClick = (preset) => {
    setSelectedPreset(preset.value);
    handlePresetSelect(preset);
    setShowPresetDropdown(false);
    setShowCalendar(false); // Close the calendar
  };

  const handlePresetSelect = (preset) => {
    const newDate = new Date();
    if (preset.value === null) {
      setSelectedDate(null);
      setInputValue("");
      setDisplayText("");
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      if (onDateSelect) {
        onDateSelect(null);
      }
    } else {
      newDate.setDate(newDate.getDate() + preset.value);
      setSelectedDate(newDate);
      setInputValue(formatDate(newDate));
      setDisplayText(formatDisplayText(newDate));
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
      if (onDateSelect) {
        onDateSelect(newDate);
      }
    }
    setSelectedPreset("");
  };

  const handleCalendarIconClick = () => {
    if (disabled) return;
    setShowCalendar(!showCalendar);
    if (!showCalendar) {
      setShowPresetDropdown(false);
    }
  };

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function parseDate(str) {
    const [day, month, year] = str.split("/").map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const date = new Date(year, month - 1, day);
      if (
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year
      ) {
        return date;
      }
    }
    return null;
  }

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setInputValue(formatDate(date));
    setDisplayText(formatDisplayText(date));
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
    setShowCalendar(false);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleClickOutside = (event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target) &&
      presetDropdownRef.current &&
      !presetDropdownRef.current.contains(event.target)
    ) {
      setShowCalendar(false);
      setShowMonthPicker(false);
      setShowYearPicker(false);
      setShowPresetDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    const date = parseDate(value);
    if (date) {
      setSelectedDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
      setDisplayText(formatDisplayText(date));
    }
  };

  const renderCalendar = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const weeks = [];
    let days = [];
    // Add days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <td
          key={`prev-${i}`}
          className="prev-month"
          onClick={() =>
            handleDateClick(
              new Date(currentYear, currentMonth - 1, daysInPrevMonth - i)
            )
          }
        >
          {daysInPrevMonth - i}
        </td>
      );
    }
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isWorkday = date.getDay() >= 0 && date.getDay() <= 4; // Sunday to Thursday
      if (days.length === 7) {
        weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
        days = [];
      }
      days.push(
        <td
          key={day}
          className={`${selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear
            ? "selected"
            : ""
            } ${isToday ? "today" : ""} ${isWorkday ? "workday" : ""}`}
          onClick={() => handleDateClick(new Date(currentYear, currentMonth, day))}
        >
          {day}
        </td>
      );
    }
    // Add days from next month
    const addNextMonthDays = () => {
      let nextMonthDay = 1;
      while (days.length < 7) {
        const day = nextMonthDay;
        days.push(
          <td
            key={`next-${day}`}
            className="next-month"
            onClick={() =>
              handleDateClick(
                new Date(currentYear, currentMonth + 1, day)
              )
            }
          >
            {day}
          </td>
        );
        nextMonthDay++;
      }
    };
    addNextMonthDays();
    weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
    return (
      <table><thead><tr>
        {daysOfWeek.map((day, index) => (
          <th key={index}>{day}</th>
        ))}
      </tr></thead><tbody>{weeks}</tbody></table>
    );
  };


  const handlePrevMonth = (event) => {
    event.preventDefault();
    if (showYearPicker) {
      setStartYear(startYear - 10);
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const handleNextMonth = (event) => {
    event.preventDefault();
    if (showYearPicker) {
      setStartYear(startYear + 10);
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleMonthClick = (month) => {
    setCurrentMonth(month);
    setShowMonthPicker(false);
  };

  const handleYearClick = (year) => {
    setCurrentYear(year);
    setShowYearPicker(false);
    setShowMonthPicker(true);
  };

  const handleHeaderClick = () => {
    if (showMonthPicker) {
      setShowMonthPicker(false);
      setShowYearPicker(true);
    } else if (!showYearPicker) {
      setShowMonthPicker(true);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setInputValue(formatDate(today));
    setDisplayText(formatDisplayText(today));
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());

    setShowCalendar(false);
    setShowMonthPicker(false);
    setShowYearPicker(false);

    if (onDateSelect) {
      onDateSelect(today);
    }
  };

  const handleClearClick = () => {
    setSelectedDate(null);
    setInputValue("");
    setDisplayText("");
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setShowCalendar(false);
    setShowMonthPicker(false);
    setShowYearPicker(false);

    if (onDateSelect) {
      onDateSelect(null);
    }
  };

  const renderMonthPicker = () => (
    <div className="month-picker">
      {months.map((month, index) => (
        <div key={index} onClick={() => handleMonthClick(index)}>
          {month}
        </div>
      ))}
    </div>
  );

  const renderYearPicker = () => {
    const years = [];
    for (let i = startYear; i < startYear + 12; i++) {
      years.push(
        <div key={i} onClick={() => handleYearClick(i)}>
          {i}
        </div>
      );
    }
    return (
      <div className="year-picker"><div className="years">{years}</div></div>
    );
  };
  return (
    <div className="date-picker" ref={datePickerRef} style={style}>
      {displayText ? (
        <div className="date-input"><div className="ui-filter-group-content">
          {displayText}
          <i
            className="icofont-close-line-circled ui-remove-filter"
            onClick={() => {
              if (disabled) return;
              setSelectedDate(null);
              setInputValue("");
              setDisplayText("");
              setCurrentMonth(today.getMonth());
              setCurrentYear(today.getFullYear());
              if (onDateSelect) {
                onDateSelect(null);
              }
            }}></i></div></div>
      ) : (
        <input
          type="text"
          className="date-input"
          value={inputValue}
          onFocus={() => {
            setShowCalendar(true);
            setShowPresetDropdown(false);
          }}
          onChange={handleInputChange}
          placeholder="בחר תאריך"
          disabled={disabled}
        />
      )}
      {showCalendar && (
        <div className="calendar" ref={calendarContainerRef}><div className="calendar-header"><div onClick={handlePrevMonth} className="arrow"><i className="icofont-arrow-right"></i></div><span onClick={handleHeaderClick} className="header-clickable">
          {showYearPicker
            ? `${startYear} - ${startYear + 11}`
            : showMonthPicker
              ? currentYear
              : `${months[currentMonth]} ${currentYear}`}
        </span><div onClick={handleNextMonth} className="arrow"><i className="icofont-arrow-left"></i></div></div>
          {showMonthPicker
            ? renderMonthPicker()
            : showYearPicker
              ? renderYearPicker()
              : renderCalendar()}
          <div className="calendar-footer"><div onClick={handleTodayClick} className="footer-button">
            היום
          </div><div onClick={handleClearClick} className="footer-button">
              נקה
            </div></div></div>
      )}
      <div
        onClick={handleCalendarIconClick}
        className={`calendar-icon-container ${showPresetSelect ? "" : "rounded-left"
          }`}
      ><i className="icofont-calendar"></i></div>
      {showPresetSelect && (
        <div
          className="preset-select"
          onClick={() => {
            if (disabled) return;
            setShowPresetDropdown(!showPresetDropdown);
            if (!showPresetDropdown) {
              setShowCalendar(false);
            }
          }}
          ref={presetDropdownRef}
        ><i className="icofont-caret-down ui-icon-arrows"></i>
          {showPresetDropdown && (
            <div className="preset-dropdown">
              {presetDates?.map((preset, index) => (
                <div
                  key={index}
                  className="preset-option"
                  onClick={() => handlePresetOptionClick(preset)}
                >
                  {preset.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
