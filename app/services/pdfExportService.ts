/**
 * Export document to PDF using html2pdf.js
 */
export async function exportToPDF(
  elementId: string,
  filename: string = 'bien-ban-kiem-tra-cu-tru.pdf'
): Promise<void> {
  // Dynamic import html2pdf to reduce initial bundle size
  const html2pdf = (await import('html2pdf.js')).default;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Không tìm thấy phần tử để xuất PDF');
  }

  // Clone element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Remove any problematic CSS colors (oklch, lab, etc.)
  const allElements = clonedElement.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);

    // Force safe colors
    if (computedStyle.color) {
      htmlEl.style.color = '#000000';
    }
    if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      htmlEl.style.backgroundColor = '#ffffff';
    }
    if (computedStyle.borderColor) {
      htmlEl.style.borderColor = '#000000';
    }
  });

  // Set root element styles
  clonedElement.style.color = '#000000';
  clonedElement.style.backgroundColor = '#ffffff';

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
      logging: false,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
    },
    pagebreak: { mode: 'avoid-all' as const },
  };

  // Create a temporary container
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.appendChild(clonedElement);
  document.body.appendChild(tempContainer);

  try {
    await html2pdf().set(opt).from(clonedElement).save();
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
}

/**
 * Open browser print dialog
 */
export function printDocument(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Không tìm thấy phần tử để in');
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback to regular print if popup blocked
    window.print();
    return;
  }

  // Get the element's HTML
  const content = element.outerHTML;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>In Biên Bản Kiểm Tra Cư Trú</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: "Times New Roman", Times, serif;
            font-size: 13px;
            line-height: 1.5;
            color: #000;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            body {
              margin: 0;
              padding: 10mm;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
}
