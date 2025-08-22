# Property Field Mapping Manager

The Property Field Mapping Manager is a comprehensive tool for diagnosing and fixing property field mapping issues in your Handoff application.

## Accessing the Mapping Manager

To access the Property Field Mapping Manager, add the following URL parameter to your application:

```
?mapping-manager=true
```

For example:
```
https://your-app-url.com/?mapping-manager=true
```

## Features

### 1. Issues & Fixes Tab

This tab automatically detects and displays mapping issues:

- **Missing Mappings**: Fields that have no mapping configured
- **Broken Paths**: Mappings that point to non-existent data paths
- **Empty Values**: Mappings that return empty or null values

For each issue, the manager provides:
- Clear description of the problem
- Suggested fixes
- Automatically detected potential mappings from API response data
- One-click buttons to apply suggested mappings

### 2. Manage Mappings Tab

This tab allows you to:

- View all current field mappings
- Edit mapping configurations
- Enable/disable individual mappings
- Delete unused mappings
- Configure data types and transformation functions

### 3. API Data Browser Tab

This tab provides:

- Real-time view of all available ATTOM API endpoint data
- Searchable field paths with sample values
- Copy-to-clipboard functionality for field paths
- Data type information for each field

## How to Fix "Not Available" Fields

When you see "Not Available" in the property summary:

1. **Access the Mapping Manager**: Add `?mapping-manager=true` to your URL
2. **Enter Test Address**: Use the same address that's showing issues
3. **Click "Analyze"**: This loads current API data
4. **Review Issues**: Check the "Issues & Fixes" tab for detected problems
5. **Apply Fixes**: Use the suggested mappings or create custom ones
6. **Save Changes**: Click "Save Changes" to persist your updates
7. **Test**: Return to your main application to verify fixes

## Common Field Mappings

Here are some common ATTOM API field paths you might need:

### Address Fields
- Street: `property[0].address.oneLine`
- City: `property[0].address.locality`
- State: `property[0].address.countrySubd`
- ZIP: `property[0].address.postal1`

### Basic Property Info
- Year Built: `property[0].summary.yearbuilt`
- Property Type: `property[0].summary.proptype`
- Bedrooms: `property[0].building.rooms.beds`
- Bathrooms: `property[0].building.rooms.bathstotal`
- Square Footage: `property[0].building.size.livingsize`

### Financial Data
- Assessed Value: `property[0].assessment.assessed.assdtotvalue`
- Market Value: `property[0].avm.amount.value`

### Owner Information
- Owner Name: `property[0].owner.owner1.lastname`

## Best Practices

1. **Test with Real Addresses**: Always use actual property addresses when configuring mappings
2. **Check Multiple Endpoints**: Different data may be available in different ATTOM API endpoints
3. **Use Data Types**: Set appropriate data types (string, number, date) for proper formatting
4. **Regular Validation**: Periodically check your mappings to ensure they still work
5. **Backup Settings**: Document your working mappings for future reference

## Troubleshooting

### Issue: Mapping Manager Won't Load
- Ensure your ATTOM API key is properly configured
- Check browser console for error messages
- Verify the URL parameter is exactly `?mapping-manager=true`

### Issue: No Data Appears in API Browser
- Verify the test address is in the correct format: "Street, City, State"
- Ensure the ATTOM API key has access to the endpoints
- Check if the property exists in the ATTOM database

### Issue: Mappings Don't Save
- Check browser console for error messages
- Ensure all required fields are filled in each mapping
- Verify you're not using invalid characters in field paths

### Issue: Still Showing "Not Available" After Mapping
- Double-check the field path syntax
- Verify the source endpoint contains the expected data
- Check if data type conversion is needed
- Test the mapping using the "Issues & Fixes" suggestions

## Support

If you continue to experience issues with field mappings:

1. Check the browser console for error messages
2. Verify your ATTOM API key configuration
3. Test with known working property addresses
4. Review the API Data Browser to confirm data availability

The mapping manager provides comprehensive diagnostics to help identify and resolve most mapping issues automatically.