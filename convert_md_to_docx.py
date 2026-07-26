#!/usr/bin/env python3
"""
Convertisseur Markdown → DOCX
Convertit RAPPORT_PROJET_Systeme_Recommandation_Films.md en fichier Word .docx
avec une mise en page professionnelle.
"""

import re
import os
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


def add_code_format(paragraph, text, font_size=9):
    """Ajoute du texte formaté comme du code (inline ou bloc)."""
    run = paragraph.add_run(text)
    run.font.name = 'Consolas'
    run.font.size = Pt(font_size)
    run.font.color.rgb = RGBColor(30, 30, 30)
    # Fond gris clair
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), 'F5F5F5')
    shading.set(qn('w:val'), 'clear')
    run._element.get_or_add_rPr().append(shading)
    return run


def add_paragraph_with_format(doc, text, style='Normal', bold=False, 
                               color=None, font_size=None, alignment=None,
                               space_before=None, space_after=None):
    """Ajoute un paragraphe avec formatage optionnel."""
    p = doc.add_paragraph(style=style)
    run = p.add_run(text)
    if bold:
        run.bold = True
    if color:
        run.font.color.rgb = color
    if font_size:
        run.font.size = Pt(font_size)
    if alignment:
        p.alignment = alignment
    if space_before:
        p.paragraph_format.space_before = Pt(space_before)
    if space_after:
        p.paragraph_format.space_after = Pt(space_after)
    return p, run


def process_markdown_table(doc, table_block):
    """Convertit un tableau Markdown en tableau DOCX."""
    lines = table_block.strip().split('\n')
    if len(lines) < 2:
        return
    
    # Ignorer la ligne de séparation (celle avec |---|---|)
    data_lines = [l for l in lines if not re.match(r'^[\s\|:\-\+]+$', l)]
    if not data_lines:
        return
    
    rows = []
    for line in data_lines:
        # Nettoyer et extraire les cellules entre pipes
        cleaned = line.strip()
        if cleaned.startswith('|'):
            cleaned = cleaned[1:]
        if cleaned.endswith('|'):
            cleaned = cleaned[:-1]
        cells = [c.strip() for c in cleaned.split('|')]
        # Nettoyer les cellules vides en trop
        cells = [c for c in cells if c or c == '']
        if len(cells) > 0:
            rows.append(cells)
    
    if not rows:
        return
    
    # Trouver le nombre max de colonnes
    max_cols = max(len(r) for r in rows)
    table = doc.add_table(rows=len(rows), cols=max_cols)
    table.style = 'Light Grid Accent 1'
    
    for i, row_data in enumerate(rows):
        for j, cell_text in enumerate(row_data):
            if j >= max_cols:
                break
            cell = table.rows[i].cells[j]
            cell.text = ''
            p = cell.paragraphs[0]
            run = p.add_run(cell_text)
            run.font.size = Pt(9)
            if i == 0:  # Header row
                run.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                shading = OxmlElement('w:shd')
                shading.set(qn('w:fill'), '4A4A8A')
                shading.set(qn('w:val'), 'clear')
                cell._element.get_or_add_tcPr().append(shading)


def convert_markdown_to_docx(md_file, docx_file):
    """Convertit un fichier Markdown en DOCX."""
    
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    doc = Document()
    
    # Style de base
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    style.paragraph_format.space_after = Pt(6)
    style.paragraph_format.line_spacing = 1.15
    
    # Couleurs du thème
    PURPLE_DARK = RGBColor(80, 40, 130)
    PURPLE_MEDIUM = RGBColor(100, 60, 160)
    GRAY_DARK = RGBColor(60, 60, 60)
    GRAY_TEXT = RGBColor(100, 100, 100)
    
    # Séparer en blocs
    lines = content.split('\n')
    i = 0
    in_code_block = False
    code_buffer = []
    in_table = False
    table_buffer = []
    
    while i < len(lines):
        line = lines[i]
        
        # Code block
        if line.startswith('```'):
            if in_code_block:
                # Fin du bloc de code
                if code_buffer:
                    p = doc.add_paragraph()
                    p.paragraph_format.space_before = Pt(6)
                    p.paragraph_format.space_after = Pt(6)
                    add_code_format(p, '\n'.join(code_buffer), font_size=8)
                    code_buffer = []
                in_code_block = False
            else:
                in_code_block = True
                code_buffer = []
            i += 1
            continue
        
        if in_code_block:
            code_buffer.append(line)
            i += 1
            continue
        
        # Ligne vide
        if not line.strip():
            # Vider le buffer de tableau si nécessaire
            if in_table and table_buffer:
                process_markdown_table(doc, '\n'.join(table_buffer))
                doc.add_paragraph()  # spacing
                table_buffer = []
                in_table = False
            i += 1
            continue
        
        # Détecter les tableaux (contient | et ---)
        if '|' in line and '---' in lines[i+1] if i+1 < len(lines) else False:
            in_table = True
            table_buffer.append(line)
            i += 1
            continue
        
        if in_table:
            table_buffer.append(line)
            i += 1
            continue
        
        # Titres
        if line.startswith('# '):
            text = line[2:].strip()
            add_paragraph_with_format(doc, text, bold=True, 
                                       color=PURPLE_DARK, font_size=22,
                                       space_before=24, space_after=12,
                                       alignment=WD_ALIGN_PARAGRAPH.LEFT)
        
        elif line.startswith('## '):
            text = line[3:].strip()
            add_paragraph_with_format(doc, text, bold=True, 
                                       color=PURPLE_MEDIUM, font_size=16,
                                       space_before=18, space_after=8)
        
        elif line.startswith('### '):
            text = line[4:].strip()
            add_paragraph_with_format(doc, text, bold=True, 
                                       color=GRAY_DARK, font_size=13,
                                       space_before=14, space_after=6)
        
        elif line.startswith('#### '):
            text = line[5:].strip()
            add_paragraph_with_format(doc, text, bold=True, 
                                       color=GRAY_DARK, font_size=11,
                                       space_before=10, space_after=4)
        
        # Ligne de séparation
        elif line.strip() == '---':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            # Ajouter une bordure horizontale
            pBdr = OxmlElement('w:pBdr')
            bottom = OxmlElement('w:bottom')
            bottom.set(qn('w:val'), 'single')
            bottom.set(qn('w:sz'), '6')
            bottom.set(qn('w:space'), '1')
            bottom.set(qn('w:color'), 'CCCCCC')
            pBdr.append(bottom)
            p._element.get_or_add_pPr().append(pBdr)
        
        # Listes non-ordonnées
        elif line.strip().startswith('- ') or line.strip().startswith('* '):
            text = re.sub(r'^[\s]*[-*]\s+', '', line)
            p = doc.add_paragraph(style='List Bullet')
            # Traiter le gras et le code inline
            parts = re.split(r'(\*\*.*?\*\*|`.*?`)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.bold = True
                elif part.startswith('`') and part.endswith('`'):
                    run = p.add_run(part[1:-1])
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9)
                else:
                    p.add_run(part)
        
        # Listes ordonnées
        elif re.match(r'^\s*\d+[\.\)]\s+', line):
            text = re.sub(r'^\s*\d+[\.\)]\s+', '', line)
            p = doc.add_paragraph(style='List Number')
            parts = re.split(r'(\*\*.*?\*\*|`.*?`)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.bold = True
                elif part.startswith('`') and part.endswith('`'):
                    run = p.add_run(part[1:-1])
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9)
                else:
                    p.add_run(part)
        
        else:
            # Paragraphe normal avec formatage inline
            text = line.strip()
            if text:
                p = doc.add_paragraph()
                # Traiter les éléments inline : gras, code, italique
                parts = re.split(r'(\*\*.*?\*\*|`.*?`|\*.*?\*)', text)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        run = p.add_run(part[2:-2])
                        run.bold = True
                    elif part.startswith('`') and part.endswith('`'):
                        run = p.add_run(part[1:-1])
                        run.font.name = 'Consolas'
                        run.font.size = Pt(9)
                        shading = OxmlElement('w:shd')
                        shading.set(qn('w:fill'), 'F0F0F0')
                        shading.set(qn('w:val'), 'clear')
                        run._element.get_or_add_rPr().append(shading)
                    elif part.startswith('*') and part.endswith('*') and len(part) > 2:
                        run = p.add_run(part[1:-1])
                        run.italic = True
                    else:
                        p.add_run(part)
        
        i += 1
    
    # Traiter le dernier tableau si présent
    if in_table and table_buffer:
        process_markdown_table(doc, '\n'.join(table_buffer))
    
    # Pied de page
    doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("— Document généré automatiquement —")
    run.font.size = Pt(8)
    run.font.color.rgb = GRAY_TEXT
    run.italic = True
    
    # En-tête du document
    section = doc.sections[0]
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)
    
    # Sauvegarde
    doc.save(docx_file)
    return True


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(base_dir, 'RAPPORT_PROJET_Systeme_Recommandation_Films.md')
    docx_path = os.path.join(base_dir, 'RAPPORT_PROJET_Systeme_Recommandation_Films.docx')
    
    if not os.path.exists(md_path):
        print(f"❌ Fichier non trouvé : {md_path}")
        exit(1)
    
    print(f"[INFO] Conversion de : {md_path}")
    print(f"[INFO] Destination : {docx_path}")
    
    try:
        convert_markdown_to_docx(md_path, docx_path)
        file_size = os.path.getsize(docx_path)
        print(f"[SUCCESS] Conversion reussie !")
        print(f"[INFO] Taille : {file_size / 1024:.1f} KB")
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
        exit(1)
