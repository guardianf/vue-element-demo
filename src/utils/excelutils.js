const Excel = require('exceljs')
async function exportSheetExcel(luckysheet, name) {
  // 1.创建工作簿，可以为工作簿添加属性
  const workbook = new Excel.Workbook()
  // 2.创建表格，第二个参数可以配置创建什么样的工作表
  luckysheet.every(function(table) {
    if (table.cellData.length === 0) return true
    const worksheet = workbook.addWorksheet(table.name)
    // 3.设置单元格合并,设置单元格边框,设置单元格样式,设置值
    setStyleAndValue(table.cellData, worksheet)
    setMerge(table.mergeData, worksheet)
    setBorder(table.config.borderInfo, worksheet)
    return true
  })
  // 4.写入 buffer
  const buffer = await workbook.xlsx.writeBuffer()
  saveFile(buffer, name)
  return buffer
}

var saveFile = function(buf, name) {
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
  })
  const downloadElement = document.createElement('a')
  const href = window.URL.createObjectURL(blob)
  downloadElement.href = href
  downloadElement.download = name + '.xlsx' // 文件名字
  document.body.appendChild(downloadElement)
  downloadElement.click()
  document.body.removeChild(downloadElement) // 下载完成移除元素
  window.URL.revokeObjectURL(href) // 释放掉blob对象
}

// 转换颜色
var rgb2hex = function(rgb) {
  if (rgb.charAt(0) === '#') {
    return rgb
  }

  var ds = rgb.split(/\D+/)
  var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3])
  return '#' + zero_fill_hex(decimal, 6)

  function zero_fill_hex(num, digits) {
    var s = num.toString(16)
    while (s.length < digits) s = '0' + s
    return s
  }
}

var setMerge = function(luckyMerge = {}, worksheet) {
  const mergearr = Object.values(luckyMerge)
  mergearr.forEach(function(elem) {
    // elem格式：{r: 0, c: 0, rs: 1, cs: 2}
    // 按开始行，开始列，结束行，结束列合并（相当于 K10:M12）
    worksheet.mergeCells(
      elem.r + 1,
      elem.c + 1,
      elem.r + elem.rs,
      elem.c + elem.cs
    )
  })
}

var setBorder = (luckyBorderInfo, worksheet) => {
  if (!Array.isArray(luckyBorderInfo)) return
  luckyBorderInfo.forEach((elem) => {
    var val = elem
    const border = {}
    const luckyToExcel = {
      type: {
        'border-top': 'top',
        'border-right': 'right',
        'border-bottom': 'bottom',
        'border-left': 'left'
      },
      style: {
        0: 'none',
        1: 'thin',
        2: 'hair',
        3: 'dotted',
        4: 'dashDot',
        5: 'dashDot',
        6: 'dashDotDot',
        7: 'double',
        8: 'medium',
        9: 'mediumDashed',
        10: 'mediumDashDot',
        11: 'mediumDashDotDot',
        12: 'slantDashDot',
        13: 'thick'
      }
    }

    if (val.rangeType === 'range') {
      const color = val.color.replace('#', '').toUpperCase()
      if (val.borderType === 'border-all') {
        border['top'] = {
          style: luckyToExcel.style[val.style],
          color: { argb: color }
        }
        border['right'] = {
          style: luckyToExcel.style[val.style],
          color: { argb: color }
        }
        border['bottom'] = {
          style: luckyToExcel.style[val.style],
          color: { argb: color }
        }
        border['left'] = {
          style: luckyToExcel.style[val.style],
          color: { argb: color }
        }
      } else {
        border[luckyToExcel.type[val.borderType]] = {
          style: luckyToExcel.style[val.style],
          color: { argb: color }
        }
      }
      val.range.forEach((item) => {
        for (let r = item.row[0]; r < item.row[1] + 1; r++) {
          for (let c = item.column[0]; c < item.column[1] + 1; c++) {
            worksheet.getCell(r + 1, c + 1).border = border
          }
        }
      })
    } else if (val.rangeType === 'cell') {
      border['top'] = {
        style: luckyToExcel.style[val.value.t.style],
        color: { argb: val.value.t.color.replace('#', '').toUpperCase() }
      }
      border['right'] = {
        style: luckyToExcel.style[val.value.r.style],
        color: { argb: val.value.r.color.replace('#', '').toUpperCase() }
      }
      border['bottom'] = {
        style: luckyToExcel.style[val.value.b.style],
        color: { argb: val.value.b.color.replace('#', '').toUpperCase() }
      }
      border['left'] = {
        style: luckyToExcel.style[val.value.l.style],
        color: { argb: val.value.l.color.replace('#', '').toUpperCase() }
      }
      worksheet.getCell(
        val.value.row_index + 1,
        val.value.col_index + 1
      ).border = border
    }
  })
}

var setStyleAndValue = function(cellArr, worksheet) {
  if (!Array.isArray(cellArr)) return

  cellArr.forEach(function(row, rowid) {
    const dbrow = worksheet.getRow(rowid + 1)
    // 设置单元格行高,默认乘以1.2倍
    dbrow.height = window.luckysheet.getRowHeight([rowid])[rowid] * 1.2
    row.every(function(cell, columnid) {
      if (!cell) return true
      if (rowid === 0) {
        const dobCol = worksheet.getColumn(columnid + 1)
        // 设置单元格列宽除以8
        dobCol.width =
          window.luckysheet.getColumnWidth([columnid])[columnid] / 8
      }
      const fill = fillConvert(cell.bg)
      const font = fontConvert(
        cell.ff,
        cell.fc,
        cell.bl,
        cell.it,
        cell.fs,
        cell.cl,
        cell.ul
      )
      const alignment = alignmentConvert(cell.vt, cell.ht, cell.tb, cell.tr)
      let value

      var v = ''
      if (cell.ct && cell.ct.t === 'inlineStr') {
        var s = cell.ct.s
        s.forEach(function(val) {
          v += val.v
        })
      } else {
        v = cell.v
      }
      if (cell.f) {
        value = { formula: cell.f, result: v }
      } else {
        value = v
      }
      const target = worksheet.getCell(rowid + 1, columnid + 1)
      target.fill = fill
      target.font = font
      target.alignment = alignment
      target.value = value
      return true
    })
  })
}

var fillConvert = function(bg) {
  if (!bg) {
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '#ffffff'.replace('#', '') }
    }
  }
  bg = bg.indexOf('rgb') > -1 ? rgb2hex(bg) : bg
  const fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: bg.replace('#', '') }
  }
  return fill
}

var fontConvert = function(
  ff = 0,
  fc = '#000000',
  bl = 0,
  it = 0,
  fs = 10,
  cl = 0,
  ul = 0
) {
  // luckysheet：ff(样式), fc(颜色), bl(粗体), it(斜体), fs(大小), cl(删除线), ul(下划线)
  const luckyToExcel = {
    0: '微软雅黑',
    1: '宋体（Song）',
    2: '黑体（ST Heiti）',
    3: '楷体（ST Kaiti）',
    4: '仿宋（ST FangSong）',
    5: '新宋体（ST Song）',
    6: '华文新魏',
    7: '华文行楷',
    8: '华文隶书',
    9: 'Arial',
    10: 'Times New Roman ',
    11: 'Tahoma ',
    12: 'Verdana',
    num2bl: function(num) {
      return num !== 0
    }
  }

  const font = {
    name: ff,
    family: 1,
    size: fs,
    color: { argb: fc.replace('#', '') },
    bold: luckyToExcel.num2bl(bl),
    italic: luckyToExcel.num2bl(it),
    underline: luckyToExcel.num2bl(ul),
    strike: luckyToExcel.num2bl(cl)
  }

  return font
}

var alignmentConvert = function(
  vt = 'default',
  ht = 'default',
  tb = 'default',
  tr = 'default'
) {
  // luckysheet:vt(垂直), ht(水平), tb(换行), tr(旋转)
  const luckyToExcel = {
    vertical: {
      0: 'middle',
      1: 'top',
      2: 'bottom',
      default: 'top'
    },
    horizontal: {
      0: 'center',
      1: 'left',
      2: 'right',
      default: 'left'
    },
    wrapText: {
      0: false,
      1: false,
      2: true,
      default: false
    },
    textRotation: {
      0: 0,
      1: 45,
      2: -45,
      3: 'vertical',
      4: 90,
      5: -90,
      default: 0
    }
  }

  const alignment = {
    vertical: luckyToExcel.vertical[vt],
    horizontal: luckyToExcel.horizontal[ht],
    wrapText: luckyToExcel.wrapText[tb],
    textRotation: luckyToExcel.textRotation[tr]
  }
  return alignment
}

export { exportSheetExcel }
