#!/usr/bin/env python3
"""
Theorize DOCX - Remplace les blocs de code du rapport par des explications theoriques.
Transforme un rapport technique en document academique/theorique.
"""

import re
import os
import sys


def theorize_markdown(md_content):
    """
    Remplace les blocs de code (``` ```) par des explications theoriques.
    Remplace aussi le code inline (`code`) par des descriptions.
    """
    lines = md_content.split('\n')
    output = []
    i = 0
    in_code_block = False
    code_type = ""
    code_lines = []
    
    while i < len(lines):
        line = lines[i]
        
        # Detection debut/fin bloc de code
        if line.startswith('```') and not in_code_block:
            in_code_block = True
            code_type = line[3:].strip()  # python, bash, yaml, etc.
            code_lines = []
            i += 1
            continue
        
        if line.startswith('```') and in_code_block:
            # Fin du bloc - generer l'explication theorique
            in_code_block = False
            explanation = generate_theoretical_explanation(code_type, code_lines)
            output.append(explanation)
            code_type = ""
            code_lines = []
            i += 1
            continue
        
        if in_code_block:
            code_lines.append(line)
            i += 1
            continue
        
        # Remplacer le code inline `...` par des descriptions
        if '`' in line:
            line = replace_inline_code(line)
        
        output.append(line)
        i += 1
    
    # Si un bloc de code n'est pas ferme, le traiter quand meme
    if in_code_block and code_lines:
        explanation = generate_theoretical_explanation(code_type, code_lines)
        output.append(explanation)
    
    return '\n'.join(output)


def replace_inline_code(line):
    """Remplace le code inline par des descriptions theoriques."""
    # Remplacer `nom_fonction()` par description
    line = re.sub(r'`([^`]+)`', r'[\1]', line)
    return line


def generate_theoretical_explanation(code_type, code_lines):
    """Genere une explication theorique pour un bloc de code."""
    code = '\n'.join(code_lines)
    
    explanations = {
        # === BASH / Commandes ===
        'bash': """**Approche theorique :**
La mise en place de l'environnement de developpement suit les principes standards du genie logiciel. On utilise la virtualisation d'environnement (via `python -m venv`) pour isoler les dependances du projet, garantissant ainsi la reproductibilite des resultats. L'installation des bibliotheques via un gestionnaire de paquets (`pip`) assure la coherence des versions utilisees.""",
        
        # === Python / Data Science ===
        'python': """**Approche theorique :**
La manipulation des donnees repose sur l'utilisation de structures de donnees tabulaires (DataFrames) qui permettent de representer les donnees sous forme de matrices lignes-colonnes. Les operations de filtrage, d'agregation et de transformation suivent le paradigme Split-Apply-Combine, largement utilise en analyse de donnees. La creation de matrices de contingence (pivot tables) est essentielle pour transformer des donnees longitudinales en format adapte aux algorithmes de machine learning.""",
        
        # === Python specifique recommender ===
        'python\nclass MovieRecommender:': """**Approche theorique :**
Le systeme de recommandation implemente un algorithme de filtrage collaboratif fonde sur le calcul de similarite entre utilisateurs. La similarite cosinus mesure l'angle entre les vecteurs de notes des utilisateurs, permettant d'identifier les profils aux gouts similaires independamment de leur echelle de notation. La prediction des notes pour les films non consultes s'effectue par moyenne ponderee des notes attribuees par les voisins les plus proches, ou les poids correspondent aux coefficients de similarite.""",
        
        # === TSX / React ===
        'tsx': """**Approche theorique :**
L'interface utilisateur est construite selon le paradigme des composants, chaque composant encapsulant une fonctionnalite specifique de l'application. L'utilisation de hooks (useState, useEffect) permet de gerer les etats internes et les effets de bord lies aux appels API. L'architecture suit le principe de separation des preoccupations (Separation of Concerns) en distinguant les couches de presentation (composants), de donnees (services) et de routage (pages).""",
        
        # === YAML / Docker ===
        'yaml': """**Approche theorique :**
L'infrastructure est definie de maniere declarative via Docker Compose, suivant les principes de l'Infrastructure as Code (IaC). Chaque service (base de donnees, API, frontend) est conteneurise de maniere isolee, facilitant le deploiement et la scalabilite. L'orchestration des conteneurs permet de gerer les dependances entre services et la persistence des donnees via des volumes.""",
        
        # === CSS ===
        'css': """**Approche theorique :**
La mise en forme visuelle repose sur une approche utility-first, ou chaque classe CSS correspond a une propriete de style unique. Les animations sont definies via des keyframes CSS, permettant des transitions fluides sans recourir a JavaScript. L'utilisation de variables CSS (`:root`) centralise les valeurs thematiques pour une maintenance simplifiee.""",
        
        # === TXT / requirements ===
        'txt': """**Approche theorique :**
La gestion des dependances est assuree par un fichier de specification qui liste l'ensemble des bibliotheques necessaires au projet, chacune avec sa version precise. Cette approche garantit la reproductibilite de l'environnement d'execution et facilite le deploiement sur differentes plateformes.""",
        
        # === CSV (donnees) ===
        'csv': """**Approche theorique :**
Les donnees sont stockees au format CSV (Comma-Separated Values), un format tabulaire standard qui organise l'information en lignes (enregistrements) et colonnes (attributs). L'identifiant unique (primary key) permet de referencer chaque entite et d'etablir des relations entre les differentes tables du jeu de donnees.""",
        
        # === gitignore ===
        '': """**Approche theorique :**
La configuration du versionnement suit les bonnes pratiques de gestion de code source, en excluant les fichiers generes automatiquement, les dependances telechargeables et les informations sensibles. Cette separation entre code source et artefacts de construction est un principe fondamental du genie logiciel.""",
    }
    
    # Recherche par type de code
    key = code_type
    if key in explanations:
        return explanations[key]
    
    # Fallback: explication generique
    if not code_type or code_type in ['python', 'tsx', 'css', 'yaml', 'bash', 'txt', 'csv']:
        return f"""**Approche theorique :**
Le bloc de code ci-dessus implemente les concepts algorithmiques decrits dans cette section. La demarche suit les principes etablis de l'ingenierie logicielle et de l'analyse de donnees, en utilisant des structures de controle et des operations vectorisees pour garantir a la fois la clarte du code et l'efficacite des calculs."""
    
    return '\n'.join(code_lines)  # Garder tel quel si type inconnu


def convert_md_to_docx_theorique(md_file, docx_file):
    """Convertit le Markdown theorise en DOCX."""
    from docx import Document
    from docx.shared import Pt, Cm, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    
    # Lire et theoriser le Markdown
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    theorized = theorize_markdown(content)
    
    # Creer le document DOCX
    doc = Document()
    
    # Style de base
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)
    style.paragraph_format.space_after = Pt(6)
    style.paragraph_format.line_spacing = 1.15
    
    PURPLE_DARK = RGBColor(80, 40, 130)
    PURPLE_MEDIUM = RGBColor(100, 60, 160)
    GRAY_DARK = RGBColor(60, 60, 60)
    GRAY_TEXT = RGBColor(100, 100, 100)
    THEORY_COLOR = RGBColor(0, 80, 60)  # Vert fonce pour theorie
    
    lines = theorized.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        if not line.strip():
            i += 1
            continue
        
        # Titres
        if line.startswith('# '):
            text = line[2:].strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(text)
            run.bold = True
            run.font.size = Pt(22)
            run.font.color.rgb = PURPLE_DARK
            p.paragraph_format.space_before = Pt(24)
            p.paragraph_format.space_after = Pt(12)
        
        elif line.startswith('## '):
            text = line[3:].strip()
            p = doc.add_paragraph()
            run = p.add_run(text)
            run.bold = True
            run.font.size = Pt(16)
            run.font.color.rgb = PURPLE_MEDIUM
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(8)
        
        elif line.startswith('### '):
            text = line[4:].strip()
            p = doc.add_paragraph()
            run = p.add_run(text)
            run.bold = True
            run.font.size = Pt(13)
            run.font.color.rgb = GRAY_DARK
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
        
        elif line.startswith('#### '):
            text = line[5:].strip()
            p = doc.add_paragraph()
            run = p.add_run(text)
            run.bold = True
            run.font.size = Pt(11)
            run.font.color.rgb = GRAY_DARK
            p.paragraph_format.space_before = Pt(10)
        
        # Separateur
        elif line.strip() == '---':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            pBdr = OxmlElement('w:pBdr')
            bottom = OxmlElement('w:bottom')
            for attr, val in [('w:val', 'single'), ('w:sz', '6'), ('w:space', '1'), ('w:color', 'CCCCCC')]:
                bottom.set(qn(attr), val)
            pBdr.append(bottom)
            p._element.get_or_add_pPr().append(pBdr)
        
        # Texte theorique (avec **[Motif:**)
        elif '**Approche theorique :**' in line:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(8)
            # Fond vert clair
            shading = OxmlElement('w:shd')
            shading.set(qn('w:fill'), 'E8F5E9')
            shading.set(qn('w:val'), 'clear')
            p._element.get_or_add_pPr().append(shading)
            
            # Texte "Approche theorique" en gras vert
            run = p.add_run('📖 Approche theorique :')
            run.bold = True
            run.font.size = Pt(10)
            run.font.color.rgb = THEORY_COLOR
            
            # Ajouter la suite si presente sur la meme ligne
            rest = line.split('**Approche theorique :**', 1)[1]
            if rest:
                run2 = p.add_run(rest)
                run2.font.size = Pt(10)
                run2.font.color.rgb = THEORY_COLOR
        
        # Lignes avec contenu theorique  
        elif '**Approche theorique :**' in ''.join(lines[max(0,i-1):i+1]):
            p = doc.add_paragraph()
            shading = OxmlElement('w:shd')
            shading.set(qn('w:fill'), 'E8F5E9')
            shading.set(qn('w:val'), 'clear')
            p._element.get_or_add_pPr().append(shading)
            run = p.add_run(line)
            run.font.size = Pt(10)
            run.font.color.rgb = THEORY_COLOR
        
        # Listes
        elif line.strip().startswith('- ') or line.strip().startswith('* '):
            text = re.sub(r'^[\s]*[-*]\s+', '', line)
            p = doc.add_paragraph(style='List Bullet')
            parts = re.split(r'(\*\*.*?\*\*)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.bold = True
                elif part.startswith('[') and part.endswith(']') and len(part) > 4:
                    run = p.add_run(part[1:-1])
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9)
                else:
                    p.add_run(part)
        
        # Lignes de tableau (contiennent |)
        elif '|' in line and line.strip().startswith('|'):
            # Collecter tout le tableau
            table_lines = []
            while i < len(lines) and '|' in lines[i] and lines[i].strip():
                table_lines.append(lines[i].strip())
                i += 1
            # Traiter le tableau
            data_lines = [l for l in table_lines if not re.match(r'^[\s\|:\-]+$', l)]
            if len(data_lines) >= 2:
                rows_data = []
                for dl in data_lines:
                    cleaned = dl.strip().strip('|')
                    cells = [c.strip() for c in cleaned.split('|')]
                    rows_data.append(cells)
                
                max_cols = max(len(r) for r in rows_data)
                table = doc.add_table(rows=len(rows_data), cols=max_cols)
                table.style = 'Light Grid Accent 1'
                
                for ri, row_data in enumerate(rows_data):
                    for cj, cell_text in enumerate(row_data):
                        if cj >= max_cols:
                            break
                        cell = table.rows[ri].cells[cj]
                        cell.text = ''
                        p = cell.paragraphs[0]
                        run = p.add_run(cell_text)
                        run.font.size = Pt(9)
                        if ri == 0:
                            run.bold = True
                            run.font.color.rgb = RGBColor(255, 255, 255)
                            shd = OxmlElement('w:shd')
                            shd.set(qn('w:fill'), '4A4A8A')
                            shd.set(qn('w:val'), 'clear')
                            cell._element.get_or_add_tcPr().append(shd)
                doc.add_paragraph()
            continue  # On a deja incremente i dans la boucle while
        
        else:
            # Paragraphe normal
            text = line.strip()
            if text:
                p = doc.add_paragraph()
                parts = re.split(r'(\*\*.*?\*\*)', text)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        run = p.add_run(part[2:-2])
                        run.bold = True
                    else:
                        p.add_run(part)
        
        i += 1
    
    # Pied de page
    doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("— Document theorique genere automatiquement —")
    run.font.size = Pt(8)
    run.font.color.rgb = GRAY_TEXT
    run.italic = True
    
    # Marges
    section = doc.sections[0]
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)
    
    doc.save(docx_file)
    return True


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(base_dir, 'RAPPORT_PROJET_Systeme_Recommandation_Films.md')
    docx_path = os.path.join(base_dir, 'RAPPORT_PROJET_Systeme_Recommandation_Films_THEORIQUE.docx')
    
    if not os.path.exists(md_path):
        print(f"[ERROR] Fichier non trouve : {md_path}")
        sys.exit(1)
    
    print(f"[INFO] Source : {md_path}")
    print(f"[INFO] Destination : {docx_path}")
    
    try:
        convert_md_to_docx_theorique(md_path, docx_path)
        file_size = os.path.getsize(docx_path)
        print(f"[SUCCESS] Conversion theorique reussie !")
        print(f"[INFO] Taille : {file_size / 1024:.1f} KB")
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
