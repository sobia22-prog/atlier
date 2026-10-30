import struct
import json

def update_model():
    # Read base model from public/modals/sofa.obj converted GLB or existing GLB
    with open('public/models/sofa.glb', 'rb') as f:
        data = f.read()

    magic, ver, total = struct.unpack('<III', data[:12])
    c0_len, c0_type = struct.unpack('<II', data[12:20])
    js = json.loads(data[20:20+c0_len])

    c1_header_offset = 20 + c0_len
    c1_len, c1_type = struct.unpack('<II', data[c1_header_offset:c1_header_offset+8])
    bin_data = bytearray(data[c1_header_offset+8:c1_header_offset+8+c1_len])

    # Exact sampled sRGB to linear colors matching user's reference picture 1:
    # 1. Sofa Body (Warm Cream Linen): sRGB (204, 194, 183) -> linear [0.608, 0.543, 0.478, 1.0]
    # 2. Ochre Cushion (Warm Mustard/Ochre): sRGB (183, 150, 107) -> linear [0.478, 0.312, 0.150, 1.0]
    # 3. Purple Cushion (Muted Lilac/Purple): sRGB (170, 130, 165) -> linear [0.407, 0.228, 0.380, 1.0]
    # 4. Rose Cushion (Dusty Rose/Terracotta): sRGB (175, 122, 116) -> linear [0.435, 0.198, 0.177, 1.0]
    # 5. Base / Feet (Smoked Dark Wood): sRGB (35, 30, 27) -> linear [0.016, 0.012, 0.010, 1.0]

    for mat in js['materials']:
        name = mat.get('name', '')
        print('Configuring material:', name)
        pbr = mat.setdefault('pbrMetallicRoughness', {})

        if name == 'm_sofa':
            # Main sofa body: soft warm cream linen
            pbr['baseColorFactor'] = [0.82, 0.78, 0.73, 1.0]
            pbr['roughnessFactor'] = 0.85
            pbr['metallicFactor'] = 0.02
        elif 'bottom' in name:
            # Base feet: dark smoked espresso
            pbr['baseColorFactor'] = [0.04, 0.03, 0.025, 1.0]
            pbr['roughnessFactor'] = 0.5
            pbr['metallicFactor'] = 0.1
        elif '004' in name:
            # Ochre / Golden Mustard pillow
            pbr['baseColorFactor'] = [0.72, 0.55, 0.32, 1.0]
            pbr['roughnessFactor'] = 0.8
            pbr['metallicFactor'] = 0.02
        elif '002' in name:
            # Lilac / Muted Purple pillow
            pbr['baseColorFactor'] = [0.65, 0.45, 0.63, 1.0]
            pbr['roughnessFactor'] = 0.8
            pbr['metallicFactor'] = 0.02
        elif '003' in name:
            # Dusty Rose / Coral Pink pillow
            pbr['baseColorFactor'] = [0.70, 0.42, 0.39, 1.0]
            pbr['roughnessFactor'] = 0.8
            pbr['metallicFactor'] = 0.02

    # Serialize JSON
    new_json_bytes = json.dumps(js, separators=(',', ':')).encode('utf-8')
    while len(new_json_bytes) % 4 != 0:
        new_json_bytes += b' '

    new_c0_len = len(new_json_bytes)
    new_c1_len = len(bin_data)
    new_total_len = 12 + 8 + new_c0_len + 8 + new_c1_len

    new_header = struct.pack('<III', magic, ver, new_total_len)
    new_c0_header = struct.pack('<II', new_c0_len, 0x4E4F534A)
    new_c1_header = struct.pack('<II', new_c1_len, 0x004E4942)

    output = new_header + new_c0_header + new_json_bytes + new_c1_header + bin_data

    with open('public/models/sofa.glb', 'wb') as f:
        f.write(output)
    with open('public/modals/sofa.glb', 'wb') as f:
        f.write(output)
    with open('public/models/premium-sofa.glb', 'wb') as f:
        f.write(output)

    print('SUCCESS! Updated GLB with exact colors from reference picture 1! Size:', len(output))

update_model()
