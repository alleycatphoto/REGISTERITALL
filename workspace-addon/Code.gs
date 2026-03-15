const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Submissions';

const COLORS = {
  PRIMARY: '#f2633a', // Rorange
  NEUTRAL: '#696a6d', // Felt Grey
};

function buildUniversalHomepage(e) {
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('UnderItAll Wholesale')
      .setSubtitle('Recent Submissions')
      .setImageUrl('https://storage.googleapis.com/msgsndr/G3HF4z9DuWL3asaPQRIY/media/697d741c1fd8270586056843.png')
      .setImageStyle(CardService.ImageStyle.SQUARE)
    );

  var section = CardService.newCardSection()
    .setHeader('Latest Applications');

  var submissions = fetchRecentSubmissions();

  if (submissions.length === 0) {
    section.addWidget(CardService.newTextParagraph()
      .setText('<font color="' + COLORS.NEUTRAL + '">No recent submissions found.</font>'));
  } else {
    submissions.forEach(function(sub) {
      var text = '<b>' + sub.firmName + '</b><br>' +
                 '<font color="' + COLORS.NEUTRAL + '">' + sub.firstName + ' ' + sub.lastName + ' | ' + sub.email + '</font>';
      
      if (sub.aiSummary) {
        text += '<br><br><i>✨ AI Insight: ' + sub.aiSummary + '</i>';
      }
      
      section.addWidget(CardService.newTextParagraph().setText(text));
      
      var viewButton = CardService.newTextButton()
        .setText('View Details')
        .setBackgroundColor(COLORS.PRIMARY)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(CardService.newAction().setFunctionName('viewDetails').setParameters({email: sub.email}));
        
      section.addWidget(CardService.newButtonSet().addButton(viewButton));
    });
  }

  var refreshButton = CardService.newTextButton()
    .setText('Refresh')
    .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
    .setOnClickAction(CardService.newAction().setFunctionName('buildUniversalHomepage'));

  section.addWidget(CardService.newButtonSet().addButton(refreshButton));

  card.addSection(section);
  return card.build();
}

function fetchRecentSubmissions() {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return [];
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return []; // Only headers or empty
    
    var startRow = Math.max(2, lastRow - 9); // Get up to last 10 rows
    var numRows = lastRow - startRow + 1;
    
    var data = sheet.getRange(startRow, 1, numRows, 21).getValues(); // Assuming 21 columns based on schema + AI summary
    
    var submissions = [];
    for (var i = data.length - 1; i >= 0; i--) { // Reverse to show newest first
      var row = data[i];
      submissions.push({
        firmName: row[0],
        businessType: row[1],
        yearsInBusiness: row[2],
        firstName: row[3],
        lastName: row[4],
        email: row[5],
        phone: row[6],
        website: row[7],
        instagramHandle: row[8],
        businessAddress: row[9],
        businessAddress2: row[10],
        city: row[11],
        state: row[12],
        zipCode: row[13],
        isTaxExempt: row[14],
        taxId: row[15],
        marketingOptIn: row[16],
        smsConsent: row[17],
        termsAccepted: row[18],
        receivedSampleSet: row[19],
        aiSummary: row[20] || ''
      });
    }
    return submissions;
  } catch (e) {
    console.error('Error fetching submissions:', e);
    return [];
  }
}

function viewDetails(e) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Details for " + e.parameters.email))
    .build();
}
